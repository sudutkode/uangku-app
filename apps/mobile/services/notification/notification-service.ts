import {
  ALLOWED_APP_NAMES,
  SUPPORTED_APPS_CONFIG,
} from "@/constants/supported-apps";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import {AppRegistry, Platform} from "react-native";

import {processNotificationResponseInternal} from "./handler";
import {TransactionParser} from "./parser";
import {setupNotificationCategories, setupNotificationChannel} from "./setup";
import {syncPendingTransactions} from "./sync";
import {RawAndroidNotification} from "./types";

// ─── EXPORTS (TIDAK BOLEH BERUBAH) ───────────────────────────────────────────

export const processNotificationResponse = processNotificationResponseInternal;
export {
  setupNotificationCategories,
  setupNotificationChannel,
  syncPendingTransactions,
};

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-TRANSACTION-ACTION";

// ─── BACKGROUND TASK (WAJIB DI SINI) ─────────────────────────────────────────

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

// ─── HEADLESS LISTENER (WAJIB DI SINI) ───────────────────────────────────────

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

    if (!ALLOWED_APP_NAMES.find((n) => n.toLowerCase() === appName)) return;

    const appConfig = SUPPORTED_APPS_CONFIG.find(
      (a) => a.name.toLowerCase() === appName,
    );

    const walletLabel = appConfig?.label ?? parsed.app;

    const text = parsed.text?.trim() || parsed.bigText?.trim() || "";
    const title = parsed.title?.trim() || "";
    const combined = `${title} ${text}`;

    if (TransactionParser.isNonTransaction(combined)) return;

    const amount = TransactionParser.extractAmount(combined);
    if (!amount) return;

    const transactionTypeId = TransactionParser.detectType(title, text);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${
          transactionTypeId === 1 ? "+" : "-"
        }Rp ${amount.toLocaleString("id-ID")} • ${walletLabel}`,

        body: text || title,

        categoryIdentifier: "transaction_actions",

        data: {
          type: "transaction_confirmation",
          app: parsed.app,
          appLabel: walletLabel,
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
