import * as SecureStore from "expo-secure-store";
import {useCallback, useEffect, useRef, useState} from "react";
import {AppState, AppStateStatus} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";

const STORAGE_KEY = "notification_access_last_reminded";
const REMINDER_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

export function useNotificationAccessReminder(enabled: boolean) {
  const [showReminder, setShowReminder] = useState(false);
  const appState = useRef(AppState.currentState);

  const check = useCallback(async () => {
    if (!enabled) return;

    try {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      if (status === "authorized") {
        setShowReminder(false);
        return;
      }

      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      const lastReminded = raw ? parseInt(raw, 10) : 0;
      const now = Date.now();

      if (now - lastReminded >= REMINDER_INTERVAL_MS) {
        await SecureStore.setItemAsync(STORAGE_KEY, String(now));
        setShowReminder(true);
      }
    } catch {
      // Handle failed here if needed, for now we just won't show the reminder
    }
  }, [enabled]);

  // Cek first time on mount
  useEffect(() => {
    check();
  }, [check]);

  // Cek every time app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (appState.current !== "active" && nextState === "active") {
          check();
        }
        appState.current = nextState;
      },
    );
    return () => sub.remove();
  }, [check]);

  const dismiss = useCallback(() => setShowReminder(false), []);

  return {showReminder, dismiss};
}
