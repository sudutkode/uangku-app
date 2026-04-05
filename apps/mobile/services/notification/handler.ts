import * as Notifications from "expo-notifications";
import {AppState} from "react-native";
import {QueueManager} from "./queue";
import {syncPendingTransactions} from "./sync";
import {ParsedNotification} from "./types";

const processedIdentifiers = new Set<string>();

export const processNotificationResponseInternal = async (
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
