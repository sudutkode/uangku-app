import {Dropdown, Switch} from "@/components/inputs";
import {LoadingState, Snackbar} from "@/components/ui";
import {SUPPORTED_APPS_CONFIG} from "@/constants/supported-apps";
import {useFetch, useMutation} from "@/hooks/axios";
import {useTransactionsStore, useWalletsStore} from "@/store"; // Tambah store transaksi
import {Wallet} from "@/types";
import {Stack, useRouter} from "expo-router";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  // Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface WalletFormProps {
  id?: string;
}

const formatBalanceInput = (raw: string): string => {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
};

const parseBalance = (formatted: string): number => {
  return Number(formatted.replace(/[^0-9]/g, "")) || 0;
};

const WalletForm: FC<WalletFormProps> = ({id}) => {
  const {colors} = useTheme();
  const router = useRouter();
  const isEdit = !!id;

  // Store actions
  const wallets = useWalletsStore((s) => s.wallets);
  const setRefetchWallets = useWalletsStore((s) => s.setNeedsRefetch);
  const setRefetchTransactions = useTransactionsStore((s) => s.setNeedsRefetch);

  const [form, setForm] = useState({name: "", balance: "", appName: ""});
  const [isSupported, setIsSupported] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State Dialog

  // ─── Options for Dropdown ──────────────────────────────────────────────────
  const appOptions = useMemo(() => {
    const filtered = SUPPORTED_APPS_CONFIG.filter((app) => {
      const alreadyUsed = wallets.find((w) => w.appName === app.name);
      if (isEdit && form.appName === app.name) return true;
      return !alreadyUsed;
    });

    return filtered.map((app) => ({
      label: app.label,
      value: app.name,
    }));
  }, [wallets, isEdit, form.appName]);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const {data: existingData, loading: loadingExisting} = useFetch<{
    data: Wallet;
  }>(`/wallets/${id}`, {}, !isEdit);

  const {
    mutate: mutateWallet,
    loading: loadingSubmit,
    error: saveError,
  } = useMutation(isEdit ? `/wallets/${id}` : "/wallets", {
    method: isEdit ? "patch" : "post",
  });

  // Mutation untuk delete
  const {
    mutate: deleteWallet,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/wallets/${id}`, {method: "delete"});

  // Sync data saat mode Edit
  useEffect(() => {
    if (existingData?.data) {
      const {name, balance, appName} = existingData.data;
      setForm({
        name,
        balance: formatBalanceInput(String(balance)),
        appName: appName || "",
      });
      setIsSupported(Boolean(appName));
    }
  }, [existingData]);

  // Handle error dari save maupun delete
  useEffect(() => {
    if (saveError || deleteError) {
      setIsError(true);
    }
  }, [saveError, deleteError]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAppSelect = useCallback((val?: string) => {
    const selectedApp = SUPPORTED_APPS_CONFIG.find((a) => a.name === val);
    setForm((p) => ({
      ...p,
      appName: val || "",
      name: selectedApp?.label || "",
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await mutateWallet({
        name: form.name.trim(),
        balance: parseBalance(form.balance),
        appName: isSupported ? form.appName : null,
      });
      setRefetchWallets(true);
      setRefetchTransactions(true); // Refetch transaksi juga
      router.back();
    } catch {
      // Error ditangani useEffect
    }
  }, [
    form,
    isSupported,
    mutateWallet,
    router,
    setRefetchWallets,
    setRefetchTransactions,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteDialog(false);
    try {
      await deleteWallet({});
      setRefetchWallets(true);
      setRefetchTransactions(true);
      router.back();
    } catch {
      // Error ditangani useEffect
    }
  }, [deleteWallet, router, setRefetchWallets, setRefetchTransactions]);

  // ─── UI Helpers ────────────────────────────────────────────────────────────
  const headerRight = useCallback(
    () =>
      isEdit ? (
        <Button
          textColor={colors.error}
          onPress={() => setShowDeleteDialog(true)}
          disabled={loadingDelete}
          loading={loadingDelete}
        >
          Hapus
        </Button>
      ) : null,
    [isEdit, colors.error, loadingDelete],
  );

  const handleSwitchSupportApp = (val: boolean) => {
    setIsSupported(val);
    setForm((p) => ({...p, appName: "", name: ""}));
  };

  if (loadingExisting) return <LoadingState message="Memuat dompet..." />;

  const disabledSave = isSupported ? !form.appName : !form.name;
  const activeError = saveError || deleteError;

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Stack.Screen
        options={{
          title: isEdit ? "Ubah Dompet" : "Dompet Baru",
          headerRight: headerRight, // Tambahkan tombol delete di header
        }}
      />

      <View style={styles.fields}>
        {!isEdit && (
          <Switch
            label="Dompet Terintegrasi"
            value={isSupported}
            onValueChange={handleSwitchSupportApp}
          />
        )}

        {isSupported ? (
          <Dropdown
            label="Pilih Dompet"
            value={form.appName}
            onSelect={handleAppSelect}
            options={appOptions}
            disabled={isEdit}
          />
        ) : (
          <TextInput
            mode="outlined"
            label="Nama Dompet"
            value={form.name}
            onChangeText={(v) => setForm((p) => ({...p, name: v}))}
          />
        )}

        <TextInput
          mode="outlined"
          label="Saldo"
          value={form.balance}
          onChangeText={(v) =>
            setForm((p) => ({...p, balance: formatBalanceInput(v)}))
          }
          keyboardType="numeric"
          left={<TextInput.Affix text="Rp" />}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loadingSubmit}
        style={styles.submitBtn}
        disabled={disabledSave || loadingSubmit}
      >
        Simpan
      </Button>

      {/* Dialog Konfirmasi Delete */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>
            Hapus dompet?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Ini akan menghapus secara permanen dompet{" "}
              <Text style={{fontWeight: "bold"}}>{form.name}</Text> beserta
              seluruh riwayat transaksinya. Tindakan ini tidak dapat dibatalkan.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Batal</Button>
            <Button textColor={colors.error} onPress={handleDeleteConfirm}>
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={isError}
        onDismiss={() => setIsError(false)}
        text={activeError || "Terjadi kesalahan sistem"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: "space-between"},
  fields: {gap: 12},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  submitBtn: {borderRadius: 8},
});

export default WalletForm;
