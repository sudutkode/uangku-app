import {useGmailSync} from "@/hooks/use-gmail-sync";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {formatDistanceToNow} from "date-fns";
import {id as localeId} from "date-fns/locale";
import React, {useState} from "react";
import {Alert, StyleSheet, View} from "react-native";
import {Button, Snackbar, Text, useTheme} from "react-native-paper";

export default function GmailSyncButton() {
  const {colors} = useTheme();
  const {syncing, status, lastResult, error, triggerSync} = useGmailSync();
  const [snackVisible, setSnackVisible] = useState(false);

  const lastSyncLabel = status?.lastSyncAt
    ? `Sync terakhir: ${formatDistanceToNow(new Date(status.lastSyncAt), {
        addSuffix: true,
        locale: localeId,
      })}`
    : "Belum pernah sync";

  const handleSync = async () => {
    try {
      await triggerSync();
      setSnackVisible(true);
    } catch {
      // error sudah di-set di hook
    }
  };

  const handleReconnect = () => {
    Alert.alert(
      "Reconnect Gmail",
      "Akses Gmail kamu sudah expired (berlaku 7 hari di mode testing). Login ulang untuk melanjutkan auto-sync.",
      [
        {text: "Batal", style: "cancel"},
        {
          text: "Login Ulang",
          onPress: async () => {
            await GoogleSignin.signOut();
            await GoogleSignin.signIn();
            // signIn akan trigger googleSignIn di BE → refreshToken baru tersimpan
          },
        },
      ],
    );
  };

  // Tampilan berbeda kalau token expired
  if (status && !status.hasGmailAccess) {
    return (
      <View style={styles.container}>
        <View>
          <Text variant="bodySmall" style={{color: colors.error}}>
            ⚠️ Gmail sync terputus
          </Text>
          <Text variant="bodySmall" style={{color: colors.onSurfaceVariant}}>
            Tap reconnect untuk lanjutkan
          </Text>
        </View>
        <Button
          mode="outlined"
          compact
          onPress={handleReconnect}
          icon="email-alert-outline"
          textColor={colors.error}
        >
          Reconnect
        </Button>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View>
          <Text variant="bodySmall" style={{color: colors.onSurfaceVariant}}>
            {lastSyncLabel}
          </Text>
          {lastResult && lastResult.imported > 0 && (
            <Text variant="bodySmall" style={{color: colors.primary}}>
              +{lastResult.imported} transaksi baru ditambahkan
            </Text>
          )}
          {error && (
            <Text variant="bodySmall" style={{color: colors.error}}>
              {error}
            </Text>
          )}
        </View>

        <Button
          mode="outlined"
          compact
          onPress={handleSync}
          loading={syncing}
          disabled={syncing}
          icon="email-sync-outline"
        >
          {syncing ? "Syncing..." : "Sync Gmail"}
        </Button>
      </View>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {lastResult
          ? `✅ ${lastResult.imported} transaksi diimport, ${lastResult.skipped} duplikat dilewati`
          : "✅ Sync selesai"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
