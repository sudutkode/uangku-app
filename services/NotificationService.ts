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

// ─── Constants & Types ───────────────────────────────────────────────────────

const NOTIFICATION_CHANNEL_ID = "uangku_transactions";
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-TRANSACTION-ACTION";
const PENDING_QUEUE_KEY = "uangku_pending_transactions";

export interface ParsedNotification {
  app: string;
  appLabel: string;
  title: string;
  text: string;
  date: string;
  amount: number;
  transactionTypeId: number; // 1 = Income, 2 = Expense
}

const log = (msg: string, detail?: any) => {
  console.log(`[UangKu-Log] ${msg}`, detail ?? "");
};

// ─── Amount Helpers ──────────────────────────────────────────────────────────

const normalizeAmountStr = (raw: string): number | null => {
  let str = raw.trim();
  str = str.replace(/[.,]\d{2}$/, "");
  str = str.replace(/[.,]/g, "");
  const value = parseInt(str, 10);
  return isNaN(value) || value <= 0 ? null : value;
};

const extractAmount = (text: string): number | null => {
  const rpMatch = text.match(/(?:rp\.?|idr)\s*([\d.,]+)/i);
  if (rpMatch) return normalizeAmountStr(rpMatch[1]);

  const keywordMatch = text.match(
    /(?:sebesar|senilai)\s+(?:rp\.?\s*)?([\d.,]+)/i,
  );
  if (keywordMatch) return normalizeAmountStr(keywordMatch[1]);

  const thousandMatch = text.match(/\b\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?\b/);
  if (thousandMatch) return normalizeAmountStr(thousandMatch[0]);

  return null;
};

const getAppLabel = (appName: string): string => {
  const config = SUPPORTED_APPS_CONFIG.find(
    (app) => app.name.toLowerCase() === appName.toLowerCase(),
  );
  return config?.label ?? appName;
};

const detectTransactionType = (title: string, text: string): number => {
  const combined = `${title} ${text}`.toLowerCase();
  const incomePatterns = [
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
  if (incomePatterns.some((rx) => rx.test(combined))) return 1;
  return 2;
};

const isNonTransactionNotification = (combined: string): boolean => {
  const lower = combined.toLowerCase();
  const hasAmount =
    /(?:rp\.?|idr)\s*[\d.,]+/.test(lower) ||
    /sebesar\s+[\d.,]+/.test(lower) ||
    /\b\d{1,3}(?:\.\d{3})+\b/.test(lower);
  if (!hasAmount) return true;
  if (
    /\botp\b|kode verifikasi|verification code|\bkode\b.{0,10}\d{4,8}/.test(
      lower,
    )
  )
    return true;
  if (
    /login baru|masuk dari|perangkat baru|new (login|sign.?in|device)/.test(
      lower,
    )
  )
    return true;
  return false;
};

// ─── Auth Token ──────────────────────────────────────────────────────────────

const getAuthToken = async (): Promise<string | null> => {
  try {
    const raw = await SecureStore.getItemAsync("auth-store");
    if (!raw) {
      log("⚠️ Auth: SecureStore kosong");
      return null;
    }
    const token = JSON.parse(raw)?.state?.accessToken ?? null;
    if (!token) log("⚠️ Auth: accessToken tidak ditemukan");
    return token;
  } catch (err) {
    log("❌ Auth: Gagal baca SecureStore", err);
    return null;
  }
};

// ─── Queue Management ────────────────────────────────────────────────────────

const saveToQueue = async (data: any): Promise<boolean> => {
  log("💾 saveToQueue: Mulai...");

  if (!data?.app) {
    log("❌ saveToQueue: app name kosong, skip");
    return false;
  }

  let queue: any[] = [];

  try {
    const existingRaw = await SecureStore.getItemAsync(PENDING_QUEUE_KEY);
    queue = existingRaw ? JSON.parse(existingRaw) : [];
    log(`💾 saveToQueue: ${queue.length} item existing`);
  } catch (err) {
    log("⚠️ saveToQueue: Gagal baca existing queue, mulai dari kosong", err);
    queue = [];
  }

  const item = {
    app: data.app?.toLowerCase() ?? "", // lowercase — BE expects lowercase package name
    appLabel: data.appLabel ?? data.app,
    title: data.title ?? "",
    text: data.text ?? "",
    date: data.date ?? new Date().toISOString(),
    amount: data.amount?.toString() ?? "0",
    transactionTypeId: data.transactionTypeId?.toString() ?? "2",
    savedAt: new Date().toISOString(),
  };

  queue.push(item);

  try {
    await SecureStore.setItemAsync(PENDING_QUEUE_KEY, JSON.stringify(queue));
    log(`✅ saveToQueue: Berhasil. Total antrean: ${queue.length}`);
    return true;
  } catch (err) {
    log("❌ saveToQueue: Gagal tulis SecureStore", err);
    return false;
  }
};

// Mutex — mencegah sync berjalan paralel (race condition saat cold start)
let isSyncing = false;

/**
 * Sync all queued transactions to BE.
 *
 * Payload matches SyncNotificationDto:
 *   appName: string   (required)
 *   title?: string
 *   text?: string
 *   date: string      (required)
 *   amount: number    (required)
 *   transactionTypeId: number (required)
 *
 * Error strategy:
 *   400 → buang (payload invalid, jangan retry)
 *   401 → hentikan semua (token expired)
 *   5xx/network → simpan untuk retry
 */
export const syncPendingTransactions = async (): Promise<void> => {
  if (isSyncing) {
    log("⏳ Sync sedang berjalan, skip duplikat");
    return;
  }

  isSyncing = true;
  log("🔄 syncPendingTransactions: Mulai...");

  try {
    let queue: any[] = [];
    try {
      const existingRaw = await SecureStore.getItemAsync(PENDING_QUEUE_KEY);
      if (!existingRaw) {
        log("🔄 Antrean kosong, skip");
        return;
      }
      queue = JSON.parse(existingRaw);
      if (queue.length === 0) return;
    } catch (err) {
      log("❌ syncPendingTransactions: Gagal baca queue", err);
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      log("⏳ Token tidak ada, sync ditunda hingga user login");
      return;
    }

    log(`🚀 Syncing ${queue.length} transaksi...`);
    const failedItems: any[] = [];
    let aborted = false;

    for (const item of queue) {
      if (aborted) {
        failedItems.push(item);
        continue;
      }

      try {
        await api.post(
          "/notifications/sync",
          {
            appName: item.app,
            title: item.title || "",
            text: item.text || "",
            date: item.date || new Date().toISOString(),
            amount: parseInt(item.amount, 10),
            transactionTypeId: parseInt(item.transactionTypeId, 10),
          },
          {headers: {Authorization: `Bearer ${token}`}},
        );
        log(`✅ Berhasil: ${item.app}`);
      } catch (err: any) {
        const status = err?.response?.status;
        const body = err?.response?.data;
        const messages = Array.isArray(body?.message)
          ? body.message
          : [body?.message ?? err?.message ?? "Unknown error"];

        log(`❌ Gagal Sync (${item.app}):`, {status, messages});

        if (status === 401) {
          log("⛔ Token expired, hentikan sync");
          failedItems.push(item);
          aborted = true;
        } else if (status === 400) {
          log(`🗑️ Item invalid (400) dibuang: ${item.app}`);
        } else {
          failedItems.push(item);
        }
      }
    }

    try {
      if (failedItems.length > 0) {
        await SecureStore.setItemAsync(
          PENDING_QUEUE_KEY,
          JSON.stringify(failedItems),
        );
        log(`⚠️ ${failedItems.length} item gagal, disimpan untuk retry`);
      } else {
        await SecureStore.deleteItemAsync(PENDING_QUEUE_KEY);
        log("✨ Antrean bersih");
        // 🔄 Trigger refetch ke UI
        try {
          const {setNeedsRefetch: setTxRefetch} =
            useTransactionsStore.getState();
          const {setNeedsRefetch: setWalletRefetch} =
            useWalletsStore.getState();

          setTxRefetch(true);
          setWalletRefetch(true);

          log("🔄 Trigger refetch transactions & wallets");
        } catch (err) {
          log("❌ Gagal trigger refetch", err);
        }
      }
    } catch (err) {
      log("❌ Gagal update queue setelah sync", err);
    }
  } finally {
    // Selalu release mutex — bahkan jika ada early return atau error
    isSyncing = false;
  }
};

// ─── Notification Response Handler ───────────────────────────────────────────

// Set untuk track identifier yang sudah diproses
// Mencegah double handling dari Background Task + addNotificationResponseReceivedListener
const processedIdentifiers = new Set<string>();

/**
 * Unified handler untuk Konfirmasi / Lewati.
 *
 * Dipanggil dari DUA tempat:
 *   1. addNotificationResponseReceivedListener (_layout.tsx) → foreground & background
 *   2. Background Task (TaskManager) → killed state
 *
 * Guard dengan processedIdentifiers supaya tidak double process
 * ketika kedua listener aktif bersamaan di background state.
 */
export const processNotificationResponse = async (
  response: Notifications.NotificationResponse,
): Promise<void> => {
  const {actionIdentifier, notification} = response;
  const content = notification.request.content;
  const identifier = notification.request.identifier;

  log(`🔔 Interaction: ${actionIdentifier}`);

  // Skip system interactions (e.g. expo.modules.notifications.actions.DEFAULT)
  if (actionIdentifier !== "confirm" && actionIdentifier !== "skip") {
    log(`ℹ️ System interaction, skip`);
    return;
  }

  // Dedup guard — Background Task dan addNotificationResponseReceivedListener
  // keduanya bisa handle response yang sama di background state.
  // Gunakan identifier unik notifikasi untuk pastikan hanya diproses sekali.
  const dedupeKey = `${identifier}:${actionIdentifier}`;
  if (processedIdentifiers.has(dedupeKey)) {
    log(`⚠️ Sudah diproses, skip duplikat: ${dedupeKey}`);
    return;
  }
  processedIdentifiers.add(dedupeKey);
  // Bersihkan setelah 30 detik supaya Set tidak tumbuh unbounded
  setTimeout(() => processedIdentifiers.delete(dedupeKey), 30_000);

  // In killed state, Expo does not hydrate content.data from the notification payload.
  // The raw payload is available as content.dataString (JSON string) instead.
  // Parse dataString as fallback so killed state works the same as background/foreground.
  let data: any = content.data ?? null;

  if (!data && (content as any).dataString) {
    try {
      data = JSON.parse((content as any).dataString);
      log("🔍 data parsed from dataString (killed state)");
    } catch {
      log("❌ Gagal parse dataString");
    }
  }

  log(`🔍 data:`, JSON.stringify(data ?? null));

  if (!data || data?.type !== "transaction_confirmation") {
    log("⚠️ data null atau bukan transaction_confirmation, skip");
    return;
  }

  // Dismiss hanya notifikasi ini saja — jangan dismissAll karena akan
  // menutup semua notifikasi lain yang belum dikonfirmasi user
  Notifications.dismissNotificationAsync(identifier).catch(() => {});

  if (actionIdentifier === "confirm") {
    log("✔️ Konfirmasi diterima, menyimpan ke queue...");
    const saved = await saveToQueue(data);
    if (!saved) {
      log("❌ Gagal simpan ke queue");
      return;
    }

    if (AppState.currentState === "active") {
      log("📱 App aktif, langsung sync...");
      await syncPendingTransactions();
    } else {
      log(`⏸️ App ${AppState.currentState} → sync saat app dibuka`);
    }
  } else if (actionIdentifier === "skip") {
    log("⏭️ User lewati transaksi");
  }
};

// ─── Notification Setup ───────────────────────────────────────────────────────

export const setupNotificationChannel = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: "Transaction Confirmations",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  });
};

export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync("transaction_actions", [
    {
      buttonTitle: "Konfirmasi",
      identifier: "confirm",
      options: {opensAppToForeground: false},
    },
    {
      buttonTitle: "Lewati",
      identifier: "skip",
      options: {opensAppToForeground: false},
    },
  ]);
};

// ─── Background Task ──────────────────────────────────────────────────────────

/**
 * Digunakan untuk handle notif action saat app di-killed.
 *
 * PENTING: Saat killed, `data` di dalam response bisa null di beberapa
 * Android version — ini OS limitation. Log full response object untuk debug.
 */
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({data, error}: any) => {
    log("🌙 Background Task Awake!");

    if (error) {
      log("❌ Task Error", error);
      return;
    }

    // Log full task data structure untuk debug killed state
    log("🔍 Full Task data:", JSON.stringify(data ?? null));

    if (data) {
      await processNotificationResponse(data);
    } else {
      log("⚠️ Task data null — killed state OS limitation");
    }
  },
);

if (Platform.OS === "android") {
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
    .then(() => log("📡 Background Task Registered"))
    .catch((err) => log("❌ Reg Error", err));
}

// ─── Confirmation Notification Trigger ───────────────────────────────────────

const triggerConfirmationNotification = async (payload: ParsedNotification) => {
  const isIncome = payload.transactionTypeId === 1;
  const amountFormatted = `${isIncome ? "+" : "-"}Rp ${payload.amount.toLocaleString("id-ID")}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: amountFormatted,
      subtitle: `UangKu · ${payload.appLabel} · ${isIncome ? "Dana Masuk" : "Dana Keluar"}`,
      body: payload.text || payload.title,
      categoryIdentifier: "transaction_actions",
      data: {
        type: "transaction_confirmation",
        app: payload.app,
        appLabel: payload.appLabel,
        title: payload.title,
        text: payload.text,
        date: payload.date,
        amount: payload.amount.toString(),
        transactionTypeId: payload.transactionTypeId.toString(),
      },
    },
    trigger: null,
  });
};

// ─── Headless Task ────────────────────────────────────────────────────────────

const headlessNotificationListener = async ({notification}: any) => {
  if (!notification) return;
  try {
    const parsed = JSON.parse(notification);
    const appName = parsed.app?.toLowerCase() || "";

    if (!ALLOWED_APP_NAMES.find((name) => name.toLowerCase() === appName))
      return;

    const text = parsed.text?.trim() || parsed.bigText?.trim() || "";
    const title = parsed.title?.trim() || "";
    const combinedText = `${title} ${text}`;

    if (isNonTransactionNotification(combinedText)) return;

    const amount = extractAmount(combinedText);
    if (!amount) return;

    const transactionTypeId = detectTransactionType(title, text);

    log(
      `🎯 Transaksi Terdeteksi: ${appName} (${transactionTypeId === 1 ? "Income" : "Expense"})`,
    );

    await triggerConfirmationNotification({
      app: parsed.app,
      appLabel: getAppLabel(appName),
      title,
      text,
      date: parsed.time
        ? new Date(parseInt(parsed.time, 10)).toISOString()
        : new Date().toISOString(),
      amount,
      transactionTypeId,
    });
  } catch (e) {
    log("❌ Headless Parse Error", e);
  }
};

if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "RNAndroidNotificationListenerHeadlessJs",
    () => headlessNotificationListener,
  );
}
