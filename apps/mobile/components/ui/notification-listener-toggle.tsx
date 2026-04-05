import React, {useEffect, useRef, useState} from "react";
import {AppState, AppStateStatus, StyleSheet, View} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";
import {Switch, Text, useTheme} from "react-native-paper";

export default function NotificationListenerToggle() {
  const {colors} = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkPermission = async () => {
    try {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      setIsEnabled(status === "authorized");
    } catch {
      setIsEnabled(false);
    }
  };

  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (appState.current !== "active" && nextAppState === "active") {
          checkPermission();
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      RNAndroidNotificationListener.requestPermission();
      await checkPermission();
    } catch {
      await checkPermission();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, {backgroundColor: colors.elevation.level2}]}
    >
      <View style={styles.textContainer}>
        <Text variant="titleSmall" style={styles.title}>
          Akses Notifikasi
        </Text>
        <Text
          variant="bodySmall"
          style={{color: colors.onSurfaceVariant, marginTop: 4}}
        >
          {isEnabled
            ? "Aktif. Transaksimu akan tercatat otomatis dari notifikasi."
            : "Nonaktif. Aktifkan agar transaksi tercatat otomatis."}
        </Text>
      </View>

      <Switch
        value={isEnabled}
        onValueChange={handleToggle}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: "600",
  },
});
