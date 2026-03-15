const {withAndroidManifest} = require("@expo/config-plugins");

module.exports = function withNotificationService(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // 1. Tetap pertahankan namespace tools
    androidManifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    if (!androidManifest.application) return config;
    const app = androidManifest.application[0];

    // 2. Tetap pertahankan perbaikan allowBackup agar build tidak gagal
    if (app.$["tools:replace"]) {
      if (!app.$["tools:replace"].includes("android:allowBackup")) {
        app.$["tools:replace"] += ",android:allowBackup";
      }
    } else {
      app.$["tools:replace"] = "android:allowBackup";
    }

    // KITA HAPUS KODE INJEKSI <service> MANUAL DI SINI.
    // Library sudah mengurusnya secara otomatis!

    return config;
  });
};
