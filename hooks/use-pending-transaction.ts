import {
  deletePendingTransaction,
  getPendingTransactions,
  PendingTransaction,
} from "@/services/NotificationService";
import {useCallback, useEffect, useState} from "react";

export const usePendingTransaction = (pendingId?: string) => {
  const [pending, setPending] = useState<PendingTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        const transactions = await getPendingTransactions();

        if (pendingId) {
          // Find specific pending transaction
          const found = transactions.find((t) => t.id === pendingId);
          setPending(found || null);
        } else if (transactions.length > 0) {
          // Use first pending transaction
          setPending(transactions[0]);
        } else {
          setPending(null);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching pending transaction:", err);
        setError("Failed to load pending transaction");
        setPending(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [pendingId]);

  const skipTransaction = useCallback(async (id: string) => {
    try {
      await deletePendingTransaction(id);
      setPending(null);
    } catch (err) {
      console.error("Error skipping transaction:", err);
      setError("Failed to skip transaction");
    }
  }, []);

  const confirmTransaction = useCallback(async (id: string) => {
    // Delete the pending record after confirmation
    // (API call happens in the confirmation screen)
    try {
      await deletePendingTransaction(id);
    } catch (err) {
      console.error("Error confirming transaction:", err);
    }
  }, []);

  return {
    pending,
    loading,
    error,
    skipTransaction,
    confirmTransaction,
  };
};
