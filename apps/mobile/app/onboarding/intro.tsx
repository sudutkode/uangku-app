import {Icon} from "@/components/ui";
import {router} from "expo-router";
import React, {useState} from "react";
import {Image, Linking, StyleSheet, View} from "react-native";
import {Button, Checkbox, Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

const FEATURES = [
  {
    icon: "bell-ring-outline" as const,
    title: "Notifikasi Otomatis",
    description:
      "Mencatat transaksi dari notifikasi m-banking & e-wallet yang muncul.",
  },
  {
    icon: "wallet-bifold-outline" as const,
    title: "Semua Dompet, Satu Tempat",
    description:
      "Pantau semua saldo sekaligus tanpa buka aplikasi satu per satu.",
  },
  {
    icon: "chart-arc" as const,
    title: "Laporan Bulanan",
    description: "Grafik pengeluaran & pemasukan bulanan yang mudah dipahami.",
  },
];

const PRIVACY_POLICY_URL = "https://sudutkode.web.app/uangku/privacy-policy";

export default function IntroScreen() {
  const {colors} = useTheme();
  const [hasOpenedPolicy, setHasOpenedPolicy] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
    setHasOpenedPolicy(true);
  };

  const handleCheckbox = () => {
    // Only allow checking if user has opened the privacy policy
    if (!hasOpenedPolicy) return;
    setIsAgreed(!isAgreed);
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/splash-icon.png")}
          style={styles.logo}
        />

        <Text variant="titleMedium" style={styles.headline}>
          Cek kesehatan finansialmu dengan Uangku.
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
        >
          Catat keuangan dari berbagai rekening m-banking dan e-wallet anda
          dalam satu dashboard.
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
                <Icon name={feature.icon} size={22} color={colors.primary} />
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
        {/* Hint text — only visible before policy is opened */}
        {!hasOpenedPolicy && (
          <Text
            variant="bodySmall"
            style={[styles.hintText, {color: colors.onSurfaceVariant}]}
          >
            Baca Kebijakan Privasi terlebih dahulu sebelum menyetujui.
          </Text>
        )}

        <View style={styles.checkboxArea}>
          <Checkbox.Android
            status={isAgreed ? "checked" : "unchecked"}
            onPress={handleCheckbox}
            color={colors.primary}
            // Visually indicate disabled state before policy is opened
            uncheckedColor={
              hasOpenedPolicy ? undefined : colors.onSurfaceVariant
            }
          />
          <Text
            variant="bodySmall"
            style={[
              styles.checkboxText,
              // Dim the label until policy is opened
              !hasOpenedPolicy && {color: colors.onSurfaceVariant},
            ]}
          >
            Saya setuju dengan{" "}
            <Text
              style={{color: colors.primary, fontWeight: "bold"}}
              onPress={openPrivacyPolicy}
            >
              Kebijakan Privasi
            </Text>{" "}
            UangKu.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push("/onboarding/permissions")}
          style={styles.button}
          contentStyle={styles.buttonContent}
          disabled={!isAgreed}
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  headline: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    gap: 10,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
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
    gap: 3,
  },
  featureTitle: {
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    gap: 4,
  },
  hintText: {
    textAlign: "center",
    marginBottom: 4,
    fontStyle: "italic",
    fontSize: 11,
  },
  checkboxArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 16,
  },
  checkboxText: {
    flexShrink: 1,
  },
  button: {
    borderRadius: 8,
    width: "100%",
  },
  buttonContent: {
    height: 52,
  },
});
