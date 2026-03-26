import {api} from "@/lib/axios";
import useTransactionsStore from "@/store/use-transactions-store";
import useWalletsStore from "@/store/use-wallets-store";
import {getAuthToken} from "./auth";
import {QueueManager} from "./queue";

let isSyncing = false;

export const syncPendingTransactions = async (): Promise<void> => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await QueueManager.getQueue();
    if (!queue.length) return;

    const token = await getAuthToken();
    if (!token) return;

    const failed = [];
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
      } catch (err: any) {
        const status = err?.response?.status;

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

    useTransactionsStore.getState().setNeedsRefetch(true);
    useWalletsStore.getState().setNeedsRefetch(true);
  } finally {
    isSyncing = false;
  }
};
