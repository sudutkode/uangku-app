import {ALLOWED_PACKAGES} from "@/constants/supported-apps";
import {api} from "@/lib/axios";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import {AppRegistry, Platform} from "react-native";
import {v4 as uuidv4} from "uuid";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedNotification {
  app: string;
  title: string;
  text: string;
  date: string;
}

export interface PendingTransaction {
  id: string;
  app: string;
  title: string;
  text: string;
  amount: number;
  timestamp: number;
  status: "pending";
}

// ─── Config ───────────────────────────────────────────────────────────────────

const NOTIFICATION_CHANNEL_ID = "uangku_transactions";
const PENDING_TRANSACTIONS_KEY = "@uangku/pending_transactions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractAmount = (text: string): number | null => {
  // Match patterns like "Rp 50.000" or "IDR 50000" or "sebesar 100000"
  const rpPattern = /(?:rp\.?)\s*[\d.,]+/i;
  const sebesarPattern = /sebesar\s+([\d.,]+)/i;
  const numberPattern = /\b(\d{1,3}(?:\.\d{3})+|\d+)\b/;

  let match = text.match(rpPattern);
  if (match) {
    const numStr = match[0].replace(/[rp\s.]/gi, "").replace(",", "");
    return parseInt(numStr, 10) || null;
  }

  match = text.match(sebesarPattern);
  if (match) {
    const numStr = match[1].replace(/\./g, "").replace(",", "");
    return parseInt(numStr, 10) || null;
  }

  match = text.match(numberPattern);
  if (match) {
    const numStr = match[1].replace(/\./g, "");
    return parseInt(numStr, 10) || null;
  }

  return null;
};

const savePendingTransaction = async (
  pending: PendingTransaction,
): Promise<void> => {
  try {
    const existing = await SecureStore.getItemAsync(PENDING_TRANSACTIONS_KEY);
    const transactions: PendingTransaction[] = existing
      ? JSON.parse(existing)
      : [];
    transactions.push(pending);
    await SecureStore.setItemAsync(
      PENDING_TRANSACTIONS_KEY,
      JSON.stringify(transactions),
    );
  } catch (error) {
    console.error("Failed to save pending transaction:", error);
  }
};

// ─── Filters ──────────────────────────────────────────────────────────────────

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
    /login baru|masuk dari|perangkat baru|new (login|sign.?in|device)|signed in from/.test(
      lower,
    )
  )
    return true;

  return false;
};

// ─── Local Notification Trigger ───────────────────────────────────────────────

const triggerConfirmationNotification = async (
  payload: ParsedNotification,
  amount: number,
): Promise<void> => {
  try {
    // Save as pending transaction in SecureStore
    const pending: PendingTransaction = {
      id: uuidv4(),
      app: payload.app,
      title: payload.title,
      text: payload.text,
      amount,
      timestamp: Date.now(),
      status: "pending",
    };
    await savePendingTransaction(pending);

    // Trigger local notification for user confirmation
    const content: any = {
      title: `Confirm: ${payload.app}`,
      body: `Rp ${amount.toLocaleString("id-ID")}\n${payload.title}`,
      data: {
        type: "transaction_confirmation",
        payload: JSON.stringify(payload),
        pendingId: pending.id,
      },
    };

    // Add Android-specific configuration
    if (Platform.OS === "android") {
      content.android = {
        channelId: NOTIFICATION_CHANNEL_ID,
        allowWhileIdle: true,
        priority: "high",
      };
    }

    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Failed to trigger confirmation notification:", error);
  }
};

// ─── Action Handler ───────────────────────────────────────────────────────────

export const handleNotificationAction = async (
  payload: ParsedNotification,
): Promise<void> => {
  try {
    await api.post("/notifications/sync", {
      app: payload.app,
      title: payload.title,
      text: payload.text,
      date: payload.date,
    });
  } catch (error) {
    console.error("Failed to sync transaction notification:", error);
    // Axios interceptors handle token refresh and 401 errors automatically
    throw error;
  }
};

// ─── SecureStore Helpers ──────────────────────────────────────────────────────

export const getPendingTransactions = async (): Promise<
  PendingTransaction[]
> => {
  try {
    const data = await SecureStore.getItemAsync(PENDING_TRANSACTIONS_KEY);
    if (!data) return [];
    const transactions: PendingTransaction[] = JSON.parse(data);
    // Filter out records older than 24 hours
    const now = Date.now();
    const filteredTransactions = transactions.filter(
      (t) => now - t.timestamp < 24 * 60 * 60 * 1000,
    );
    // Clean up expired records
    if (filteredTransactions.length < transactions.length) {
      if (filteredTransactions.length === 0) {
        await SecureStore.deleteItemAsync(PENDING_TRANSACTIONS_KEY);
      } else {
        await SecureStore.setItemAsync(
          PENDING_TRANSACTIONS_KEY,
          JSON.stringify(filteredTransactions),
        );
      }
    }
    return filteredTransactions;
  } catch (error) {
    console.error("Failed to get pending transactions:", error);
    return [];
  }
};

export const deletePendingTransaction = async (
  transactionId: string,
): Promise<void> => {
  try {
    const data = await SecureStore.getItemAsync(PENDING_TRANSACTIONS_KEY);
    if (!data) return;
    const transactions: PendingTransaction[] = JSON.parse(data);
    const filtered = transactions.filter((t) => t.id !== transactionId);
    if (filtered.length === 0) {
      await SecureStore.deleteItemAsync(PENDING_TRANSACTIONS_KEY);
    } else {
      await SecureStore.setItemAsync(
        PENDING_TRANSACTIONS_KEY,
        JSON.stringify(filtered),
      );
    }
  } catch (error) {
    console.error("Failed to delete pending transaction:", error);
  }
};

// ─── Headless task ────────────────────────────────────────────────────────────

const headlessNotificationListener = async ({
  notification,
}: any): Promise<void> => {
  if (!notification) return;

  let parsed: any;
  try {
    parsed = JSON.parse(notification);
  } catch {
    return;
  }

  const appName: string = parsed.app?.toLowerCase() || "";
  console.log("app name: ", appName);
  console.log("title: ", parsed.title);

  const isAllowed = ALLOWED_PACKAGES.find((pkg) => appName === pkg);
  if (!isAllowed) return;

  const text: string = parsed.text?.trim() || parsed.bigText?.trim() || "";
  const title: string = parsed.title?.trim() || "";

  if (!title && !text) return;

  const combinedText = `${title} ${text}`;
  if (isNonTransactionNotification(combinedText)) return;

  // Extract amount from text
  const amount = extractAmount(combinedText);
  if (!amount) return; // No valid amount found

  // Prepare notification payload
  const payload: ParsedNotification = {
    app: parsed.app,
    title,
    text,
    date: parsed.time
      ? new Date(parseInt(parsed.time)).toISOString()
      : new Date().toISOString(),
  };

  // Trigger local notification and save to SecureStore
  // User must confirm via app to execute the API call
  await triggerConfirmationNotification(payload, amount);
};

// ─── Registration ─────────────────────────────────────────────────────────────

if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "RNAndroidNotificationListenerHeadlessJs",
    () => headlessNotificationListener,
  );
}
