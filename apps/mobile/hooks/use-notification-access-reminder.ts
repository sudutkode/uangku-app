import * as SecureStore from "expo-secure-store";
import {useCallback, useEffect, useRef, useState} from "react";
import {AppState, AppStateStatus} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";

const STORAGE_KEY = "notification_access_last_reminded";
const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 jam

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
      // Gagal cek — skip agar tidak mengganggu user
    }
  }, [enabled]);

  // Cek saat pertama kali mount (user sudah login)
  useEffect(() => {
    check();
  }, [check]);

  // Cek setiap kali app kembali ke foreground
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
