import React, {useEffect, useState} from "react";
import {AppState, StyleSheet, View} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";
import {Button, Text, useTheme} from "react-native-paper";
import Icon from "./icon-fa6";

export default function NotificationTrackerButton() {
  const {colors} = useTheme();
  const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = async () => {
    const status = await RNAndroidNotificationListener.getPermissionStatus();
    setHasPermission(status === "authorized");
  };

  useEffect(() => {
    checkPermission();

    // Auto-refresh status jika user kembali dari layar Settings Android
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkPermission();
      }
    });

    return () => subscription.remove();
  }, []);

  const handleRequestPermission = () => {
    RNAndroidNotificationListener.requestPermission();
  };

  return (
    <View
      style={[styles.container, {backgroundColor: colors.elevation.level2}]}
    >
      <View style={{flex: 1, marginRight: 16}}>
        <Text variant="titleMedium" style={{fontWeight: "bold"}}>
          Auto-Track Notifikasi
        </Text>
        <Text
          variant="bodySmall"
          style={{color: colors.onSurfaceVariant, marginTop: 4}}
        >
          {hasPermission
            ? "Aktif. Aplikasi akan mencatat pengeluaran otomatis dari notifikasi E-Wallet/Bank."
            : "Berikan izin akses notifikasi untuk mencatat transaksi secara otomatis."}
        </Text>
      </View>

      {!hasPermission ? (
        <Button mode="contained" onPress={handleRequestPermission} compact>
          Aktifkan
        </Button>
      ) : (
        <View style={{alignItems: "center"}}>
          <Icon name="check-circle" size={24} color={colors.primary} />
          <Text
            variant="labelSmall"
            style={{color: colors.primary, marginTop: 4}}
          >
            Aktif
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
});
