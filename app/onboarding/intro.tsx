import {MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import React from "react";
import {StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

const FEATURES = [
  {
    icon: "bell-ring-outline" as const,
    title: "Notifikasi Otomatis",
    description:
      "Transaksi dari BCA, GoPay, OVO, DANA, dan 15+ aplikasi lain langsung tercatat — tanpa input manual.",
  },
  {
    icon: "wallet-bifold-outline" as const,
    title: "Semua Dompet, Satu Tempat",
    description:
      "Satu tampilan untuk semua saldo. Tidak perlu buka aplikasi satu per satu lagi.",
  },
  {
    icon: "chart-pie" as const,
    title: "Laporan Bulanan",
    description:
      "Analisis pengeluaran dan pemasukan bulananmu dengan grafik yang mudah dipahami.",
  },
];

export default function IntroScreen() {
  const {colors} = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.headline}>
          Kelola semua uangmu dengan UangKu
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
        >
          UangKu membaca notifikasi transaksi dari bank dan e-wallet-mu, lalu
          mencatatnya otomatis, jadi kamu selalu tahu uangmu di mana dan berapa.
        </Text>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureCard,
                {backgroundColor: colors.elevation.level2},
              ]}
            >
              <View
                style={[
                  styles.iconWrapper,
                  {backgroundColor: colors.primaryContainer},
                ]}
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text variant="titleSmall" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{color: colors.onSurfaceVariant}}
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => router.push("/onboarding/permissions")}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Mulai Sekarang
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
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
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontWeight: "600",
  },
  footer: {
    padding: 24,
  },
  button: {
    borderRadius: 8,
    width: "100%",
  },
  buttonContent: {
    height: 52,
  },
});
