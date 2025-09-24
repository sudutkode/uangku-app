import * as eva from "@eva-design/eva";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {ApplicationProvider} from "@ui-kitten/components";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import "react-native-reanimated";

import {useColorScheme} from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          <Stack.Screen
            name="modal"
            options={{presentation: "modal", title: "Modal"}}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ApplicationProvider>
  );
}
