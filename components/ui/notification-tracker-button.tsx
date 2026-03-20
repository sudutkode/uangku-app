import React, {useEffect, useRef, useState} from "react";
import {AppState, AppStateStatus, StyleSheet, View} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";
import {Button, Text, useTheme} from "react-native-paper";
import Icon from "./icon-fa6";

export default function NotificationTrackerButton() {
  const {colors} = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkPermission = async () => {
    const status = await RNAndroidNotificationListener.getPermissionStatus();
    setHasPermission(status === "authorized");
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

  const handleRequestPermission = () => {
    RNAndroidNotificationListener.requestPermission();
  };

  return (
    <View
      style={[styles.container, {backgroundColor: colors.elevation.level2}]}
    >
      <View style={{flex: 1, marginRight: 16}}>
        <Text variant="titleMedium" style={{fontWeight: "bold"}}>
          Auto-Track Notifications
        </Text>
        <Text
          variant="bodySmall"
          style={{color: colors.onSurfaceVariant, marginTop: 4}}
        >
          {hasPermission
            ? "Active. The app will automatically record transactions from your E-Wallet / Bank notifications."
            : "Grant notification access to automatically record transactions."}
        </Text>
      </View>

      {!hasPermission ? (
        <Button mode="contained" onPress={handleRequestPermission} compact>
          Activate
        </Button>
      ) : (
        <View style={{alignItems: "center"}}>
          <Icon name="check-circle" size={24} color={colors.primary} />
          <Text
            variant="labelSmall"
            style={{color: colors.primary, marginTop: 4}}
          >
            Active
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
