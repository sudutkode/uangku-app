const {withAndroidManifest} = require("@expo/config-plugins");

module.exports = function withNotificationService(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    androidManifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    if (!androidManifest.application) return config;
    const app = androidManifest.application[0];

    if (app.$["tools:replace"]) {
      if (!app.$["tools:replace"].includes("android:allowBackup")) {
        app.$["tools:replace"] += ",android:allowBackup";
      }
    } else {
      app.$["tools:replace"] = "android:allowBackup";
    }

    // Inject NotificationListenerService for react-native-android-notification-listener.
    // This library has no Expo config plugin so we must declare the service manually.
    if (!app.service) app.service = [];

    const serviceExists = app.service.some(
      (s) =>
        s.$?.["android:name"] ===
        "com.reactnativeandroidnotificationlistener.NotificationListenerService",
    );

    if (!serviceExists) {
      app.service.push({
        $: {
          "android:name":
            "com.reactnativeandroidnotificationlistener.NotificationListenerService",
          "android:permission":
            "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
          "android:exported": "false",
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
      });
    }

    return config;
  });
};
