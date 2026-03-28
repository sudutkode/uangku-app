// app/onboarding/intro.tsx
import {Icon} from "@/components/ui";
import {router} from "expo-router";
import React, {useState} from "react";
import {Image, ScrollView, StyleSheet, View} from "react-native";
import {
  Button,
  Checkbox,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
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

export default function IntroScreen() {
  const {colors} = useTheme();
  const [isAgreed, setIsAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
          Kelola uangmu dengan UangKu
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
        <View style={styles.checkboxArea}>
          <Checkbox.Android
            status={isAgreed ? "checked" : "unchecked"}
            onPress={() => setIsAgreed(!isAgreed)}
            color={colors.primary}
          />
          <Text variant="bodySmall" style={styles.checkboxText}>
            Saya setuju dengan{" "}
            <Text
              style={{color: colors.primary, fontWeight: "bold"}}
              onPress={() => setShowPrivacy(true)}
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

      <Portal>
        <Dialog
          visible={showPrivacy}
          onDismiss={() => setShowPrivacy(false)}
          style={{maxHeight: "80%", borderRadius: 20}}
        >
          <Dialog.Title style={{fontWeight: "700"}}>
            Kebijakan Privasi
          </Dialog.Title>
          <Dialog.ScrollArea style={{paddingHorizontal: 0}}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <Text variant="bodySmall" style={styles.policyText}>
                <Text style={styles.policyHeader}>1. Data Anonim{"\n"}</Text>
                UangKu menggunakan sistem {`"Pseudonymization"`}. Email Anda
                diubah menjadi kode unik (Hash) dan tidak disimpan dalam bentuk
                teks biasa. Nama asli Anda tidak akan tersimpan di server kami.
                {"\n\n"}
                <Text style={styles.policyHeader}>
                  2. Pembacaan Notifikasi{"\n"}
                </Text>
                UangKu memerlukan izin akses notifikasi hanya untuk mendeteksi
                transaksi dari aplikasi perbankan dan dompet digital resmi. Kami
                tidak membaca pesan pribadi seperti WhatsApp atau SMS personal.
                {"\n\n"}
                <Text style={styles.policyHeader}>3. Keamanan Data{"\n"}</Text>
                Semua data transaksi dienkripsi dan hanya dapat diakses oleh
                Anda melalui akun Google yang terhubung. Kami tidak menjual data
                Anda kepada pihak ketiga mana pun.{"\n\n"}
                <Text style={styles.policyHeader}>
                  4. Penghapusan Akun{"\n"}
                </Text>
                Anda memiliki hak penuh untuk menghapus akun dan seluruh data
                transaksi kapan saja melalui menu Pengaturan.
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowPrivacy(false)}>Tutup</Button>
            <Button
              onPress={() => {
                setIsAgreed(true);
                setShowPrivacy(false);
              }}
              mode="contained"
            >
              Setuju
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  policyText: {lineHeight: 20},
  policyHeader: {fontWeight: "700", fontSize: 13},
});
