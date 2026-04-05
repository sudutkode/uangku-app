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

    // Library already declares the service in its own AndroidManifest.xml.
    // We only need to override the exported attribute to false using tools:replace.
    if (!app.service) app.service = [];

    const serviceExists = app.service.some(
      (s) =>
        s.$?.["android:name"] ===
        "com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener",
    );

    if (!serviceExists) {
      app.service.push({
        $: {
          "android:name":
            "com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener",
          "android:exported": "false",
          "tools:replace": "android:exported",
        },
      });
    }

    return config;
  });
};
