/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import {Platform} from "react-native";
import {MD3DarkTheme, MD3LightTheme} from "react-native-paper";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Paper Theme Colors Definition
const customColors = {
  // --- Primary ---
  primary: "#4CAF7A",
  onPrimary: "#FFFFFF",
  primaryContainer: "#E5FFEC",
  onPrimaryContainer: "#1B4D2E",

  // --- Secondary (Neutral / Gray) ---
  secondary: "#8E9BA6",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E8EEF2",
  onSecondaryContainer: "#2A343A",

  // --- Info (Custom Blue) ---
  info: "#4FC3F7",
  onInfo: "#FFFFFF",
  infoContainer: "#E1F5FE",
  onInfoContainer: "#004E6A",

  // --- Tertiary (Warning) ---
  tertiary: "#FFB74D",
  onTertiary: "#5F3E00",
  tertiaryContainer: "#FFF3E0",
  onTertiaryContainer: "#663C00",

  // --- Error ---
  error: "#E57373",
  onError: "#FFFFFF",
  errorContainer: "#FFEBEE",
  onErrorContainer: "#B71C1C",
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
    surface: "#F1FAF3", // Background dark green for Light Mode
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
    // For Dark Mode, better use surface
    surface: MD3DarkTheme.colors.surface,
    primaryContainer: "#2D4F39",

    secondaryContainer: "#2B343A",
    infoContainer: "#1F3F4D",
    tertiaryContainer: "#4A3415",
    errorContainer: "#4B1E1E",

    // Improve contrast
    onSecondaryContainer: "#DCE3E8",
    onInfoContainer: "#B3E5FC",
    onTertiaryContainer: "#FFD8A8",
    onErrorContainer: "#FFCDD2",
  },
};
