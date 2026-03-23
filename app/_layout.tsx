import {useColorScheme} from "@/hooks/use-color-scheme";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import React, {useEffect} from "react";
import {AppState as RNAppState} from "react-native";
import {PaperProvider, adaptNavigationTheme} from "react-native-paper";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import {darkTheme, lightTheme} from "@/constants/theme";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

import {useAuthStore} from "@/store";
import {en, registerTranslation} from "react-native-paper-dates";

import * as Notifications from "expo-notifications";

import "react-native-reanimated";

// 👇 1. IMPORT SERVICE (top level)
import {useForegroundSync} from "@/services/ForegroundSyncService";
import "@/services/NotificationService";

registerTranslation("en", en);

// Configure notification channel for Android
Notifications.setNotificationChannelAsync("uangku_transactions", {
  name: "Transaction Confirmations",
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
});

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// adapt navigation theme to match react-native-paper theme
const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {user} = useAuthStore();
  const {checkAndSyncPending} = useForegroundSync();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ["profile", "email"],
    });
  }, []);

  // Listen for app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active" && user) {
        await checkAndSyncPending();
      }
    };

    const subscription = RNAppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [user, checkAndSyncPending]);

  // theme based on color scheme
  const isDark = colorScheme === "dark";
  const paperTheme = isDark ? darkTheme : lightTheme;
  const navigationTheme = isDark ? DarkTheme : LightTheme;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Protected guard={!user}>
              <Stack.Screen name="auth" />
            </Stack.Protected>

            <Stack.Protected guard={Boolean(user)}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                }}
              />
            </Stack.Protected>
          </Stack>

          <StatusBar style={isDark ? "light" : "dark"} />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
