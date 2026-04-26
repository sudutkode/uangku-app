import {NotificationIllustration} from "@/components/illustrations";
import {useAuthStore} from "@/store";
import {screenWidth} from "@/utils";
import {router} from "expo-router";
import React, {useState} from "react";
import {Platform, StyleSheet, View} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

const PERMISSION_POINTS = [
  "Membaca notifikasi aplikasi mobile banking & dompet digital anda",
  "Tidak membaca pesan pribadi, OTP, atau notifikasi non-transaksi",
  "Kamu bisa cabut izin ini kapan saja di Pengaturan",
];

export default function PermissionsScreen() {
  const {colors} = useTheme();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [isLoading, setIsLoading] = useState(false);

  const handleGrantPermission = async () => {
    if (Platform.OS !== "android") {
      router.push("/onboarding/wallets");
      return;
    }

    setIsLoading(true);
    try {
      RNAndroidNotificationListener.requestPermission();

      setTimeout(async () => {
        const status =
          await RNAndroidNotificationListener.getPermissionStatus();
        if (status === "authorized") {
          router.push("/onboarding/wallets");
        } else {
          completeOnboarding();
        }
        setIsLoading(false);
      }, 2000);
    } catch {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <NotificationIllustration
            width={screenWidth * 0.5}
            height={screenWidth * 0.5}
          />
        </View>

        <Text variant="titleMedium" style={styles.headline}>
          Izinkan akses notifikasi
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
        >
          Atur Keuangan butuh izin ini untuk mencatat transaksimu otomatis.
          Tanpanya, kamu perlu input manual setiap saat.
        </Text>

        <View style={styles.pointsContainer}>
          {PERMISSION_POINTS.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <View style={[styles.dot, {backgroundColor: colors.primary}]} />
              <Text
                variant="bodySmall"
                style={[styles.pointText, {color: colors.onSurfaceVariant}]}
              >
                {point}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleGrantPermission}
          loading={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Izinkan Akses
        </Button>
        <Button
          mode="text"
          onPress={handleSkip}
          style={styles.skipButton}
          labelStyle={{color: colors.onSurfaceVariant}}
        >
          Lewati, input manual saja
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  headline: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  pointsContainer: {
    gap: 12,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  pointText: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    gap: 4,
  },
  button: {
    borderRadius: 8,
    width: "100%",
    elevation: 0,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  skipButton: {
    borderRadius: 14,
  },
});
