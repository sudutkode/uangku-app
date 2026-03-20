import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {AppRegistry, Platform} from "react-native";

// ─── Config ───────────────────────────────────────────────────────────────────

// process.env is NOT reliably available in headless task context (app closed).
// We use a hardcoded fallback. Keep this in sync with your .env file.
// In production this will always be your real server URL anyway.
const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL || "https://uangku-server.vercel.app";

// Key used to cache the token in AsyncStorage for headless access.
// Write this key whenever the user signs in, so headless can always read it.
export const HEADLESS_TOKEN_KEY = "@uangku/headless_token";

// ─── Allowlist ────────────────────────────────────────────────────────────────

const ALLOWED_APPS_REGEX =
  /jago|gojek|gopay|ovo\.id|id\.dana|shopee|bankbkemobile|seabank|sea\.bank|com\.bca|mybca|mandiri|livin|brimo|id\.co\.bri|src\.com\.bni|mewallet|linkaja/i;

// ─── Filters ──────────────────────────────────────────────────────────────────

const isNonTransactionNotification = (combined: string): boolean => {
  const lower = combined.toLowerCase();

  // Must contain something that looks like a Rupiah amount
  const hasAmount =
    /(?:rp\.?|idr)\s*[\d.,]+/.test(lower) ||
    /sebesar\s+[\d.,]+/.test(lower) ||
    /\b\d{1,3}(?:\.\d{3})+\b/.test(lower);

  if (!hasAmount) return true; // No amount = definitely not a transaction

  // OTP / verification codes
  if (
    /\botp\b|kode verifikasi|verification code|\bkode\b.{0,10}\d{4,8}/.test(
      lower,
    )
  )
    return true;

  // Fraud filter intentionally disabled — too aggressive, was blocking
  // legitimate transaction notifications. The backend parsers handle filtering.

  // Login / device alerts
  if (
    /login baru|masuk dari|perangkat baru|new (login|sign.?in|device)|signed in from/.test(
      lower,
    )
  )
    return true;

  return false;
};

// ─── Token resolution ─────────────────────────────────────────────────────────

/**
 * Tries two strategies to get the auth token:
 * 1. AsyncStorage (fast, reliable in headless context)
 * 2. SecureStore (fallback, may not work when app is fully closed)
 *
 * Call `cacheTokenForHeadless(token)` after every sign-in so strategy 1 always works.
 */
const getToken = async (): Promise<string | null> => {
  try {
    // Strategy 1: AsyncStorage cache — always works in headless
    const cached = await AsyncStorage.getItem(HEADLESS_TOKEN_KEY);
    if (cached) return cached;
  } catch {}

  try {
    // Strategy 2: SecureStore fallback
    const storeData = await SecureStore.getItemAsync("auth-store");
    if (!storeData) return null;
    const token = JSON.parse(storeData)?.state?.accessToken;
    if (token) {
      // Cache it for next time so strategy 1 works
      await AsyncStorage.setItem(HEADLESS_TOKEN_KEY, token).catch(() => {});
    }
    return token ?? null;
  } catch {
    return null;
  }
};

/**
 * Call this from your auth store/sign-in logic after receiving a token.
 * This ensures the headless task can always find the token even when the app is closed.
 *
 * Example — in your signin() function:
 *   import { cacheTokenForHeadless } from "@/services/NotificationService";
 *   cacheTokenForHeadless(accessToken);
 */
export const cacheTokenForHeadless = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(HEADLESS_TOKEN_KEY, token);
  } catch {}
};

/**
 * Call this on sign-out to clear the cached token.
 */
export const clearHeadlessToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HEADLESS_TOKEN_KEY);
  } catch {}
};

// ─── Headless task ────────────────────────────────────────────────────────────

const headlessNotificationListener = async ({notification}: any) => {
  if (!notification) return;

  let parsed: any;
  try {
    parsed = JSON.parse(notification);
  } catch {
    return;
  }

  const appName: string = parsed.app?.toLowerCase() || "";
  if (!ALLOWED_APPS_REGEX.test(appName)) return;

  // Some apps (e.g. SeaBank) put the full message in bigText while text is empty.
  // Use bigText as fallback so we don't miss these notifications.
  const text: string = parsed.text?.trim() || parsed.bigText?.trim() || "";
  const title: string = parsed.title?.trim() || "";

  if (!title && !text) return;

  const combinedText = `${title} ${text}`;
  if (isNonTransactionNotification(combinedText)) return;

  const token = await getToken();
  if (!token) return; // User not logged in — nothing to do

  try {
    const response = await fetch(`${BASE_URL}/notifications/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        app: parsed.app,
        title,
        text,
        date: parsed.time
          ? new Date(parseInt(parsed.time)).toISOString()
          : new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      // If 401, the token is stale — clear the cache so we don't keep retrying
      if (response.status === 401) {
        await clearHeadlessToken();
      }
    }
  } catch {
    // Network error — silent fail, will retry on next notification
  }
};

// ─── Registration ─────────────────────────────────────────────────────────────

if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "RNAndroidNotificationListenerHeadlessJs",
    () => headlessNotificationListener,
  );
}
