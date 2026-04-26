import {
  ConfirmationDialog,
  NotificationListenerToggle,
  SupportedApps,
} from "@/components/ui";
import {useMutation} from "@/hooks/axios";
import {useAuthStore} from "@/store";
import {screenHeight} from "@/utils";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {format} from "date-fns";
import {id} from "date-fns/locale";
import React, {useEffect, useState} from "react";
import {Keyboard, ScrollView, StyleSheet, TextInput, View} from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  IconButton,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {colors} = useTheme();
  const {signout, user, setUser} = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");

  useEffect(() => {
    if (user?.username) {
      setNewUsername(user.username);
    }
  }, [user?.username]);

  const {mutate: deleteAccount, loading: isDeleting} = useMutation<void, any>(
    "/users/me",
    {method: "delete"},
  );

  const {mutate: updateProfile, loading: isUpdating} = useMutation<any, any>(
    "/users/me",
    {method: "patch"},
  );

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setIsEditingName(false);
      setNewUsername(user?.username || "");
      return;
    }

    try {
      const updatedUser = await updateProfile({username: newUsername});
      if (setUser) setUser(updatedUser);
      setIsEditingName(false);
      Keyboard.dismiss();
    } catch {
      setNewUsername(user?.username || "");
    }
  };

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
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            {isEditingName ? (
              <View style={styles.editRow}>
                <TextInput
                  value={newUsername}
                  onChangeText={setNewUsername}
                  style={[
                    styles.input,
                    {
                      color: colors.onSurface,
                      borderBottomColor: colors.primary,
                    },
                  ]}
                  autoFocus
                  maxLength={20}
                  returnKeyType="done"
                  onSubmitEditing={handleUpdateUsername}
                />
                {isUpdating ? (
                  <ActivityIndicator size={20} style={{marginLeft: 8}} />
                ) : (
                  <IconButton
                    icon="check"
                    size={20}
                    iconColor={colors.primary}
                    onPress={handleUpdateUsername}
                    style={{margin: 0}}
                  />
                )}
              </View>
            ) : (
              <View style={styles.displayRow}>
                <Text variant="titleLarge" style={styles.userName}>
                  {user?.username}
                </Text>
                <IconButton
                  icon="pencil-outline"
                  size={18}
                  iconColor={colors.outline}
                  onPress={() => setIsEditingName(true)}
                  style={{margin: 0, marginLeft: 4}}
                />
              </View>
            )}
          </View>

          <Text
            variant="labelSmall"
            style={{color: colors.outline, opacity: 0.6}}
          >
            ANONYMOUS ID: {user?.identifierHash?.substring(0, 12).toUpperCase()}
            ...
          </Text>
        </View>

        {/* User Info Box */}
        <View
          style={[styles.infoBox, {backgroundColor: colors.elevation.level1}]}
        >
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={{color: colors.onSurfaceVariant}}>
              Bergabung sejak
            </Text>
            <Text variant="bodySmall" style={{fontWeight: "500"}}>
              {user?.createdAt
                ? format(new Date(user.createdAt), "dd MMM yyyy", {locale: id})
                : "-"}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Feature Settings */}
        <View style={styles.section}>
          <NotificationListenerToggle />
          <SupportedApps />
        </View>

        <Divider style={styles.divider} />

        {/* Sign Out Action */}
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
                Data kamu aman dan terenkripsi di server kami.
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
              {backgroundColor: colors.errorContainer},
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
                Semua data transaksi akan dihapus permanen dan tidak bisa pulih.
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

        {/* Version Info */}
        <View style={styles.footer}>
          <Text
            variant="labelSmall"
            style={{color: colors.outlineVariant, letterSpacing: 2}}
          >
            ATUR KEUANGAN v1.0.0
          </Text>
        </View>
      </ScrollView>

      <Portal>
        <ConfirmationDialog
          title="Keluar dari Atur Keuangan?"
          content="Kamu bisa masuk kembali menggunakan akun Google yang sama untuk
              mengakses datamu."
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          handleConfirm={handleLogoutConfirm}
        />

        <ConfirmationDialog
          title="Hapus Akun?"
          content="Sistem akan menghapus identitas anonim dan seluruh data
              keuanganmu selamanya."
          withAlert
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          handleConfirm={handleDeleteAccount}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    alignItems: "center",
    marginTop: screenHeight * 0.04,
    marginBottom: 24,
    paddingHorizontal: 24,
    gap: 4,
  },
  avatar: {
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameContainer: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  userName: {
    fontWeight: "700",
  },
  input: {
    fontSize: 20,
    fontWeight: "700",
    borderBottomWidth: 2,
    minWidth: 120,
    textAlign: "center",
    paddingVertical: 4,
  },
  infoBox: {
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    marginVertical: 12,
    opacity: 0.5,
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
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  actionTitle: {
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
});
