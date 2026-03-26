import {NotificationListenerToggle, SupportedApps} from "@/components/ui";
import {useMutation} from "@/hooks/axios";
import {useAuthStore} from "@/store";
import {screenHeight} from "@/utils/common-utils";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {format} from "date-fns";
import {id} from "date-fns/locale";
import React, {useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {colors} = useTheme();
  const {signout, user} = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {mutate: deleteAccount, loading: isDeleting} = useMutation<void, any>(
    "/users/me",
    {method: "delete"},
  );

  const handleLogoutConfirm = async () => {
    try {
      setLoading(true);
      setShowLogoutDialog(false);
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      signout();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false);
    await deleteAccount({});
    await handleLogoutConfirm();
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.header}>
          <Avatar.Image
            size={80}
            source={{uri: user?.avatar}}
            style={styles.avatar}
          />
          <Text variant="titleMedium" style={styles.userName}>
            {user?.name}
          </Text>
          <Text variant="bodySmall" style={{color: colors.onSurfaceVariant}}>
            {user?.email}
          </Text>
        </View>

        <View
          style={[styles.infoBox, {backgroundColor: colors.elevation.level1}]}
        >
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={{color: colors.onSurfaceVariant}}>
              Bergabung sejak
            </Text>
            <Text variant="bodySmall">
              {user?.createdAt
                ? format(user.createdAt, "dd MMM yyyy", {locale: id})
                : "-"}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Settings */}
        <View style={styles.section}>
          <NotificationListenerToggle />
          <SupportedApps />
        </View>

        <Divider style={styles.divider} />

        {/* Sign Out */}
        <View style={styles.section}>
          <View
            style={[
              styles.actionCard,
              {backgroundColor: colors.elevation.level2},
            ]}
          >
            <View style={{flex: 1}}>
              <Text variant="titleSmall" style={styles.actionTitle}>
                Keluar
              </Text>
              <Text
                variant="bodySmall"
                style={{color: colors.onSurfaceVariant, marginTop: 4}}
              >
                Kamu bisa masuk kembali kapan saja dengan Google.
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => setShowLogoutDialog(true)}
              textColor={colors.error}
              disabled={loading}
              loading={loading}
              compact
            >
              Keluar
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Danger Zone */}
        <View style={styles.section}>
          <View
            style={[
              styles.actionCard,
              {backgroundColor: colors.errorContainer}, // Menggunakan warna kontainer error
            ]}
          >
            <View style={{flex: 1}}>
              <Text
                variant="titleSmall"
                style={[styles.actionTitle, {color: colors.onErrorContainer}]}
              >
                Hapus Akun
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: colors.onErrorContainer,
                  marginTop: 4,
                  opacity: 0.8,
                }}
              >
                Seluruh data transaksi dan dompet akan dihapus permanen.
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowDeleteDialog(true)}
              buttonColor={colors.error}
              textColor={colors.onError}
              loading={isDeleting}
              disabled={isDeleting}
              compact
            >
              Hapus
            </Button>
          </View>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text
            variant="labelSmall"
            style={{color: colors.outlineVariant, letterSpacing: 1}}
          >
            VERSI 1.0.0
          </Text>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
        >
          <Dialog.Title>Keluar dari UangKu?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Kamu bisa masuk kembali kapan saja dengan akun Google-mu.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowLogoutDialog(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onPress={handleLogoutConfirm}
              textColor={colors.error}
              loading={loading}
              disabled={loading}
            >
              Keluar
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>
            Hapus Semua Data?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{textAlign: "center"}}>
              Tindakan ini tidak dapat dibatalkan. Semua catatan keuanganmu akan
              hilang selamanya.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onPress={handleDeleteAccount}
              textColor={colors.error}
              loading={loading}
              disabled={loading}
            >
              Ya, Hapus Akun
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    alignItems: "center",
    marginTop: screenHeight * 0.025,
    marginBottom: 24,
    paddingHorizontal: 24,
    gap: 4,
  },
  avatar: {
    marginBottom: 8,
    elevation: 2,
  },
  userName: {
    fontWeight: "600",
    textAlign: "center",
  },
  infoBox: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    marginVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    marginVertical: 8,
  },
  actionTitle: {
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
});
