import {useRouter} from "expo-router";
import {getPendingTransactions} from "./NotificationService";

/**
 * Foreground Sync Service
 * Checks for pending transactions stored in SecureStore by the headless task
 * and navigates user to confirmation screen if pending records exist
 */

export const useForegroundSync = () => {
  const router = useRouter();

  const checkAndSyncPending = async (): Promise<boolean> => {
    try {
      const pending = await getPendingTransactions();

      if (pending.length > 0) {
        // Navigate to confirmation screen with first pending record
        router.push({
          pathname: "/transactions/confirm",
          params: {pendingId: pending[0].id},
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking pending transactions:", error);
      return false;
    }
  };

  return {checkAndSyncPending};
};
