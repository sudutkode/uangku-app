import {darkTheme, lightTheme} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {
  processNotificationResponse,
  setupNotificationCategories,
  setupNotificationChannel,
  syncPendingTransactions,
} from "@/services/notification/notification-service";
import {useAuthStore} from "@/store";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import React, {useEffect} from "react";
import {AppState, AppStateStatus} from "react-native";
import {adaptNavigationTheme, PaperProvider} from "react-native-paper";
import {id, registerTranslation} from "react-native-paper-dates";
import "react-native-reanimated";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

registerTranslation("id", id);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {user, isOnboarding} = useAuthStore();

  // One-time app startup setup
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ["email"],
    });
    setupNotificationChannel();
    setupNotificationCategories();

    // Handle notification button actions (foreground & background)
    // Killed state ditangani oleh Background Task di NotificationService
    const subscription = Notifications.addNotificationResponseReceivedListener(
      processNotificationResponse,
    );

    return () => subscription.remove();
  }, []);

  // Permission, cold start sync, dan resume sync saat user terautentikasi
  useEffect(() => {
    if (!user) return;

    Notifications.requestPermissionsAsync().catch(() => {});

    // Sync pending queue yang tersimpan saat killed state
    syncPendingTransactions();

    // Sync ulang setiap kali app kembali ke foreground
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        syncPendingTransactions();
      }
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => sub.remove();
  }, [user]);

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

            <Stack.Protected guard={Boolean(user && isOnboarding)}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>

            <Stack.Protected guard={Boolean(user && !isOnboarding)}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{presentation: "modal"}} />
            </Stack.Protected>
          </Stack>
          <StatusBar style={isDark ? "light" : "dark"} />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
