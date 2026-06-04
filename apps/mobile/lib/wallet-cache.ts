import * as SecureStore from "expo-secure-store";

const WALLET_CACHE_KEY = "offline_wallets_cache";

export const saveWalletsToCache = async (wallets: any[]) => {
  try {
    // STORE ONLY MINIMAL DATA TO AVOID EXCEEDING STORAGE LIMITS
    const minimalData = wallets.map((w) => ({
      appName: w.appName,
      name: w.name,
    }));
    await SecureStore.setItemAsync(
      WALLET_CACHE_KEY,
      JSON.stringify(minimalData),
    );
  } catch (error) {
    console.error("Gagal menyimpan cache wallet:", error);
  }
};

export const getWalletsFromCache = async (): Promise<any[]> => {
  try {
    const data = await SecureStore.getItemAsync(WALLET_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Gagal membaca cache wallet:", error);
    return [];
  }
};
