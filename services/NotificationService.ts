import {
  ALLOWED_APP_NAMES,
  SUPPORTED_APPS_CONFIG,
} from "@/constants/supported-apps";
import {api} from "@/lib/axios";
import useTransactionsStore from "@/store/use-transactions-store";
import useWalletsStore from "@/store/use-wallets-store";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import {AppRegistry, AppState, Platform} from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_CHANNEL_ID = "uangku_transactions";
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-TRANSACTION-ACTION";
const PENDING_QUEUE_KEY = "uangku_pending_transactions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedNotification {
  app: string;
  appLabel: string;
  title: string;
  text: string;
  date: string;
  amount: number;
  transactionTypeId: number;
}

interface RawAndroidNotification {
  app?: string;
  text?: string;
  bigText?: string;
  title?: string;
  time?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Regex Constants (Performance Optimized)
// ─────────────────────────────────────────────────────────────────────────────

const REGEX = {
  currency: /(?:rp\.?|idr)\s*([\d.,]+)/i,
  keywordAmount: /(?:sebesar|senilai)\s+(?:rp\.?\s*)?([\d.,]+)/i,
  thousand: /\b\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?\b/,
  otp: /\botp\b|kode verifikasi|verification code|\bkode\b.{0,10}\d{4,8}/,
  login: /login baru|masuk dari|perangkat baru|new (login|sign.?in|device)/,
};

const INCOME_PATTERNS: RegExp[] = [
  /uang masuk/,
  /dana masuk/,
  /saldo (kamu )?bertambah/,
  /anda telah menerima/,
  /telah menerima/,
  /kamu menerima/,
  /telah mengirim.{0,30}ke kamu/,
  /transfer masuk/,
  /diterima/,
  /top.?up/,
  /isi saldo/,
  /tambah saldo/,
  /cashback/,
  /refund/,
  /pengembalian/,
  /hadiah|bonus|reward/,
  /you (have )?received/,
  /money received/,
  /has sent you/,
  /sent you/,
  /incoming (transfer|payment)/,
  /credited (to your|to)/,
  /deposit(ed)?/,
  /payment received/,
  /transfer in/,
  /added to (your )?account/,
  /top.?up (successful|berhasil)/,
  /menerima/,
];

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Parser (PURE LOGIC)
// ─────────────────────────────────────────────────────────────────────────────

const TransactionParser = {
  normalizeAmount(raw: string): number | null {
    let str = raw.trim();
    str = str.replace(/[.,]\d{2}$/, "");
    str = str.replace(/[.,]/g, "");
    const value = parseInt(str, 10);
    return isNaN(value) || value <= 0 ? null : value;
  },

  extractAmount(text: string): number | null {
    const rpMatch = text.match(REGEX.currency);
    if (rpMatch) return this.normalizeAmount(rpMatch[1]);

    const keywordMatch = text.match(REGEX.keywordAmount);
    if (keywordMatch) return this.normalizeAmount(keywordMatch[1]);

    const thousandMatch = text.match(REGEX.thousand);
    if (thousandMatch) return this.normalizeAmount(thousandMatch[0]);

    return null;
  },

  detectType(title: string, text: string): number {
    const combined = `${title} ${text}`.toLowerCase();
    if (INCOME_PATTERNS.some((rx) => rx.test(combined))) return 1;
    return 2;
  },

  isNonTransaction(combined: string): boolean {
    const lower = combined.toLowerCase();

    const hasAmount =
      REGEX.currency.test(lower) ||
      REGEX.keywordAmount.test(lower) ||
      REGEX.thousand.test(lower);

    if (!hasAmount) return true;
    if (REGEX.otp.test(lower)) return true;
    if (REGEX.login.test(lower)) return true;

    return false;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Manager
// ─────────────────────────────────────────────────────────────────────────────

const QueueManager = {
  async getQueue(): Promise<Record<string, string>[]> {
    try {
      const raw = await SecureStore.getItemAsync(PENDING_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveQueue(queue: Record<string, string>[]) {
    await SecureStore.setItemAsync(PENDING_QUEUE_KEY, JSON.stringify(queue));
  },

  async clearQueue() {
    await SecureStore.deleteItemAsync(PENDING_QUEUE_KEY);
  },

  async enqueue(data: ParsedNotification): Promise<boolean> {
    if (!data.app) return false;

    const queue = await this.getQueue();

    queue.push({
      app: data.app.toLowerCase(),
      appLabel: data.appLabel,
      title: data.title,
      text: data.text,
      date: data.date,
      amount: data.amount.toString(),
      transactionTypeId: data.transactionTypeId.toString(),
      savedAt: new Date().toISOString(),
    });

    try {
      await this.saveQueue(queue);
      return true;
    } catch {
      return false;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth Helper
// ─────────────────────────────────────────────────────────────────────────────

const getAuthToken = async (): Promise<string | null> => {
  try {
    const raw = await SecureStore.getItemAsync("auth-store");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Sync Service (Mutex Safe)
// ─────────────────────────────────────────────────────────────────────────────

let isSyncing = false;

export const syncPendingTransactions = async (): Promise<void> => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await QueueManager.getQueue();
    if (!queue.length) return;

    const token = await getAuthToken();
    if (!token) return;

    const failed: typeof queue = [];
    let aborted = false;

    for (const item of queue) {
      if (aborted) {
        failed.push(item);
        continue;
      }

      try {
        await api.post(
          "/notifications/sync",
          {
            appName: item.app,
            title: item.title,
            text: item.text,
            date: item.date,
            amount: parseInt(item.amount, 10),
            transactionTypeId: parseInt(item.transactionTypeId, 10),
          },
          {headers: {Authorization: `Bearer ${token}`}},
        );
      } catch (err: unknown) {
        const e = err as {
          response?: {status?: number; data?: any};
          message?: string;
        };

        const status = e.response?.status;

        if (status === 401) {
          failed.push(item);
          aborted = true;
        } else if (status !== 400) {
          failed.push(item);
        }
      }
    }

    if (failed.length) {
      await QueueManager.saveQueue(failed);
      return;
    }

    await QueueManager.clearQueue();

    // trigger UI refetch
    try {
      useTransactionsStore.getState().setNeedsRefetch(true);
      useWalletsStore.getState().setNeedsRefetch(true);
    } catch {}
  } finally {
    isSyncing = false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification Response Handler
// ─────────────────────────────────────────────────────────────────────────────

const processedIdentifiers = new Set<string>();

export const processNotificationResponse = async (
  response: Notifications.NotificationResponse,
): Promise<void> => {
  const {actionIdentifier, notification} = response;
  const identifier = notification.request.identifier;

  if (actionIdentifier !== "confirm" && actionIdentifier !== "skip") return;

  const dedupeKey = `${identifier}:${actionIdentifier}`;
  if (processedIdentifiers.has(dedupeKey)) return;

  processedIdentifiers.add(dedupeKey);
  setTimeout(() => processedIdentifiers.delete(dedupeKey), 30000);

  let data: unknown = notification.request.content.data;

  if (!data && (notification.request.content as any).dataString) {
    try {
      data = JSON.parse((notification.request.content as any).dataString);
    } catch {
      return;
    }
  }

  if (
    !data ||
    typeof data !== "object" ||
    (data as any).type !== "transaction_confirmation"
  )
    return;

  Notifications.dismissNotificationAsync(identifier).catch(() => {});

  if (actionIdentifier === "confirm") {
    const saved = await QueueManager.enqueue(data as ParsedNotification);
    if (!saved) return;

    if (AppState.currentState === "active") {
      await syncPendingTransactions();
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification Setup
// ─────────────────────────────────────────────────────────────────────────────

export const setupNotificationChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: "Transaction Confirmations",
    importance: Notifications.AndroidImportance.HIGH,
  });
};

export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync("transaction_actions", [
    {buttonTitle: "Konfirmasi", identifier: "confirm"},
    {buttonTitle: "Lewati", identifier: "skip"},
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// Background Task (DO NOT MOVE)
// ─────────────────────────────────────────────────────────────────────────────

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({data, error}: {data?: unknown; error?: unknown}) => {
    if (error || !data) return;
    await processNotificationResponse(
      data as Notifications.NotificationResponse,
    );
  },
);

if (Platform.OS === "android") {
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Headless Listener (DO NOT MOVE)
// ─────────────────────────────────────────────────────────────────────────────

const headlessNotificationListener = async ({
  notification,
}: {
  notification?: string;
}) => {
  if (!notification) return;

  try {
    const parsed: RawAndroidNotification = JSON.parse(notification);
    const appName = parsed.app?.toLowerCase();
    if (!appName) return;

    if (!ALLOWED_APP_NAMES.find((name) => name.toLowerCase() === appName))
      return;

    const text = parsed.text?.trim() || parsed.bigText?.trim() || "";
    const title = parsed.title?.trim() || "";
    const combined = `${title} ${text}`;

    if (TransactionParser.isNonTransaction(combined)) return;

    const amount = TransactionParser.extractAmount(combined);
    if (!amount) return;

    const transactionTypeId = TransactionParser.detectType(title, text);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${transactionTypeId === 1 ? "+" : "-"}Rp ${amount.toLocaleString("id-ID")}`,
        body: text || title,
        categoryIdentifier: "transaction_actions",
        data: {
          type: "transaction_confirmation",
          app: parsed.app,
          appLabel:
            SUPPORTED_APPS_CONFIG.find((a) => a.name.toLowerCase() === appName)
              ?.label ?? parsed.app,
          title,
          text,
          date: parsed.time
            ? new Date(parseInt(parsed.time, 10)).toISOString()
            : new Date().toISOString(),
          amount: amount.toString(),
          transactionTypeId: transactionTypeId.toString(),
        },
      },
      trigger: null,
    });
  } catch {}
};

if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "RNAndroidNotificationListenerHeadlessJs",
    () => headlessNotificationListener,
  );
}
