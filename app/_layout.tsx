import {useColorScheme} from "@/hooks/use-color-scheme";
import {useAuthStore} from "@/store/auth-store";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import React, {useEffect} from "react";
import {PaperProvider, adaptNavigationTheme} from "react-native-paper";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import {darkTheme, lightTheme} from "@/constants/theme";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import "react-native-reanimated";

// app/_layout.tsx  (or index.js)
import {en, registerTranslation} from "react-native-paper-dates";
registerTranslation("en", en);

// adapt navigation theme to match react-native-paper theme
const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const {user} = useAuthStore();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_CLIENT_ID,
    });
  }, []);

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
