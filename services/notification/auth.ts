import * as SecureStore from "expo-secure-store";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const raw = await SecureStore.getItemAsync("auth-store");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {
    return null;
  }
};
