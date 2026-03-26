import * as SecureStore from "expo-secure-store";
import {ParsedNotification, QueueItem} from "./types";

const KEY = "uangku_pending_transactions";

export const QueueManager = {
  async getQueue(): Promise<QueueItem[]> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveQueue(queue: QueueItem[]) {
    await SecureStore.setItemAsync(KEY, JSON.stringify(queue));
  },

  async clearQueue() {
    await SecureStore.deleteItemAsync(KEY);
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
