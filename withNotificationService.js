const {withAndroidManifest} = require("@expo/config-plugins");

module.exports = function withNotificationService(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Pastikan node 'application' ada
    if (!androidManifest.application) return config;
    const app = androidManifest.application[0];

    // Ini adalah blok <service> yang diwajibkan oleh library-nya
    const notificationService = {
      $: {
        "android:name":
          "com.reactnativenotificationlistener.RNAndroidNotificationListener",
        "android:label": "@string/app_name",
        "android:permission":
          "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        "android:exported": "true",
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name":
                  "android.service.notification.NotificationListenerService",
              },
            },
          ],
        },
      ],
    };

    // Jika belum ada array service, buat baru
    if (!app.service) {
      app.service = [];
    }

    // Cek agar tidak terjadi duplikasi saat re-build
    const serviceExists = app.service.some(
      (s) =>
        s.$["android:name"] ===
        "com.reactnativenotificationlistener.RNAndroidNotificationListener",
    );

    if (!serviceExists) {
      app.service.push(notificationService);
    }

    return config;
  });
};
