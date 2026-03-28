import {SUPPORTED_APPS_CONFIG} from "@/constants/supported-apps";
import {api} from "@/lib/axios";
import {useAuthStore} from "@/store";
import React, {useMemo, useState} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Checkbox,
  Divider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

interface WalletState {
  [key: string]: {selected: boolean; balance: string};
}

export default function WalletsScreen() {
  const {colors} = useTheme();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableWallets = useMemo(() => {
    return [
      {label: "Cash", name: "manual.cash", category: "Manual"},
      ...SUPPORTED_APPS_CONFIG,
    ];
  }, []);

  const [wallets, setWallets] = useState<WalletState>(
    availableWallets.reduce(
      (acc, app) => ({
        ...acc,
        [app.name]: {selected: false, balance: ""},
      }),
      {},
    ),
  );

  const hasSelectedWallets = Object.values(wallets).some((w) => w.selected);

  const formatBalanceInput = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const handleToggle = (name: string) => {
    setWallets((prev) => ({
      ...prev,
      [name]: {...prev[name], selected: !prev[name].selected},
    }));
  };

  const handleBalanceChange = (name: string, value: string) => {
    setWallets((prev) => ({
      ...prev,
      [name]: {...prev[name], balance: formatBalanceInput(value)},
    }));
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const selectedWallets = Object.entries(wallets)
        .filter(([_, state]) => state.selected)
        .map(([name, state]) => ({
          name: availableWallets.find((a) => a.name === name)?.label ?? name,
          balance: parseInt(state.balance.replace(/\./g, "") || "0", 10),
          appName: name === "manual.cash" ? null : name,
        }));

      await Promise.all(
        selectedWallets.map((wallet) => api.post("/wallets", wallet)),
      );

      completeOnboarding();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant="titleMedium" style={styles.headline}>
            Pilih dompet yang ingin dilacak
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.subtitle, {color: colors.onSurfaceVariant}]}
          >
            Centang akun yang kamu punya dan masukkan saldo awalnya.
          </Text>

          {availableWallets.map((app, index) => {
            const isSelected = wallets[app.name].selected;
            return (
              <View key={app.name}>
                <View style={styles.walletItem}>
                  <View style={styles.walletLabel}>
                    <Text variant="bodyLarge">{app.label}</Text>
                  </View>
                  <Checkbox
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() => handleToggle(app.name)}
                    color={colors.primary}
                  />
                </View>

                {isSelected && (
                  <View style={styles.balanceInputContainer}>
                    <TextInput
                      mode="outlined"
                      label="Saldo awal"
                      placeholder="0"
                      value={wallets[app.name].balance}
                      onChangeText={(val) => handleBalanceChange(app.name, val)}
                      keyboardType="numeric"
                      left={<TextInput.Affix text="Rp" />}
                      style={styles.input}
                    />
                  </View>
                )}

                {index < availableWallets.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, {borderTopColor: colors.outlineVariant}]}>
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={isSubmitting}
            disabled={!hasSelectedWallets || isSubmitting}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Lanjutkan
          </Button>
          {!hasSelectedWallets && (
            <Button
              mode="text"
              onPress={() => completeOnboarding()}
              labelStyle={{color: colors.onSurfaceVariant}}
            >
              Lewati untuk sekarang
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {padding: 24},
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
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  walletLabel: {flex: 1},
  balanceInputContainer: {
    marginTop: 4,
    marginBottom: 16,
    paddingLeft: 8,
  },
  input: {backgroundColor: "transparent"},
  divider: {marginVertical: 4},
  footer: {
    padding: 24,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    borderRadius: 14,
    elevation: 0,
    width: "100%",
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
