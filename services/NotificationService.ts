import * as SecureStore from "expo-secure-store";
import {AppRegistry, Platform} from "react-native";

const headlessNotificationListener = async ({notification}: any) => {
  if (!notification) return;

  try {
    const parsed = JSON.parse(notification);

    // Daftar App ID bank/ewallet yang kita dukung
    const allowedApps = [
      "com.jago.app",
      "com.jago.app.syariah",
      "com.gojek.app",
      "ovo.id",
      "id.dana",
      "com.bca",
      "id.co.bankmandiri.livin",
    ];

    if (allowedApps.includes(parsed.app)) {
      console.log(
        `📬 [Background] Notifikasi dari ${parsed.app}:`,
        parsed.title,
      );

      // 1. Ambil token JWT langsung dari SecureStore (bypass Zustand hydration)
      const storeData = await SecureStore.getItemAsync("auth-store");
      if (!storeData) {
        console.log("User belum login, notifikasi diabaikan.");
        return;
      }

      const parsedStore = JSON.parse(storeData);
      const token = parsedStore?.state?.accessToken;

      if (!token) return;

      // 2. Tembak ke API menggunakan fetch (menghindari Axios UI interceptor)
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/notifications/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            app: parsed.app,
            title: parsed.title,
            text: parsed.text,
            date: new Date().toISOString(),
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [Background] Transaksi tersimpan:", result.message);
      } else {
        console.log("⚠️ [Background] Gagal menyimpan:", response.status);
      }
    }
  } catch (error) {
    console.error("❌ [Background] Error processing notification:", error);
  }
};

// Daftarkan Headless Task HANYA jika perangkatnya adalah Android
if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "RNAndroidNotificationListenerHeadlessJs",
    () => headlessNotificationListener,
  );
}
