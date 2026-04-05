import * as Notifications from "expo-notifications";
import {Platform} from "react-native";

const CHANNEL_ID = "uangku_transactions";

export const setupNotificationChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Transaction Confirmations",
    importance: Notifications.AndroidImportance.HIGH,
  });
};

export const setupNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync("transaction_actions", [
    {
      identifier: "confirm",
      buttonTitle: "Konfirmasi",
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: "skip",
      buttonTitle: "Lewati",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
};
