import {LoadingState} from "@/components/ui";
import {useFetch, useMutation} from "@/hooks/axios";
import {useTransactionsStore, useWalletsStore} from "@/store";
import {Wallet} from "@/types";
import {Stack, useRouter} from "expo-router";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface WalletFormProps {
  id?: string;
}

interface FormState {
  name: string;
  balance: string;
}

const INITIAL_FORM: FormState = {name: "", balance: ""};

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
  const setNeedsRefetchWallets = useWalletsStore((s) => s.setNeedsRefetch);
  const setNeedsRefetchTransactions = useTransactionsStore(
    (s) => s.setNeedsRefetch,
  );

  const refetchData = useCallback(() => {
    setNeedsRefetchWallets(true);
    setNeedsRefetchTransactions(true);
  }, [setNeedsRefetchWallets, setNeedsRefetchTransactions]);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [nameError, setNameError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchConfig = useMemo(() => ({}), []);
  const {data: existingData, loading: loadingExisting} = useFetch<{
    data: Wallet;
  }>(`/wallets/${id}`, fetchConfig, !id);

  const {
    mutate: mutateWallet,
    loading: loadingSubmit,
    error: saveError,
  } = useMutation<any, any>(id ? `/wallets/${id}` : "/wallets", {
    method: id ? "patch" : "post",
  });

  const {
    mutate: deleteWallet,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/wallets/${id}`, {method: "delete"});

  // ─── Sync existing data ─────────────────────────────────────────────────────

  useEffect(() => {
    if (existingData?.data) {
      setForm({
        name: existingData.data.name,
        balance: formatBalanceInput(String(existingData.data.balance)),
      });
    }
  }, [existingData]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleNameChange = useCallback((val: string) => {
    setForm((prev) => ({...prev, name: val}));
    if (val.trim()) setNameError("");
  }, []);

  const handleBalanceChange = useCallback((val: string) => {
    setForm((prev) => ({...prev, balance: formatBalanceInput(val)}));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      setNameError("Wallet name is required");
      return;
    }
    try {
      await mutateWallet({
        name: form.name.trim(),
        balance: parseBalance(form.balance),
      });
      refetchData();
      router.back();
    } catch {
      // error string already set by useMutation, shown via Snackbar
    }
  }, [form, mutateWallet, router, refetchData]);

  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteDialog(false);
    try {
      await deleteWallet({});
      refetchData();
      router.back();
    } catch {
      // error string already set by useMutation, shown via Snackbar
    }
  }, [deleteWallet, router, refetchData]);

  // ─── Header ─────────────────────────────────────────────────────────────────

  const headerRight = useCallback(
    () =>
      id ? (
        <Button
          textColor={colors.error}
          onPress={() => setShowDeleteDialog(true)}
          disabled={!existingData || loadingDelete}
          loading={loadingDelete}
        >
          Delete
        </Button>
      ) : null,
    [id, colors.error, existingData, loadingDelete],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loadingExisting) {
    return <LoadingState message="Loading wallet..." />;
  }

  const activeError = saveError || deleteError;

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Stack.Screen options={{headerRight}} />

      <View style={styles.fields}>
        <View>
          <TextInput
            mode="outlined"
            label="Wallet name"
            value={form.name}
            onChangeText={handleNameChange}
            activeOutlineColor={nameError ? colors.error : colors.primary}
            error={!!nameError}
            autoCapitalize="words"
          />
          <HelperText type="error" visible={!!nameError}>
            {nameError}
          </HelperText>
        </View>

        <View>
          <TextInput
            mode="outlined"
            label="Balance"
            value={form.balance}
            onChangeText={handleBalanceChange}
            keyboardType="numeric"
            activeOutlineColor={colors.primary}
            placeholder="0"
            left={<TextInput.Affix text="Rp" />}
          />
          <HelperText type="info" visible>
            Enter current balance of this wallet
          </HelperText>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loadingSubmit}
        disabled={loadingSubmit}
        contentStyle={styles.submitButton}
      >
        {id ? "Update Wallet" : "Save Wallet"}
      </Button>

      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={styles.dialogTitle}>Delete wallet?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently delete{" "}
              <Text style={{fontWeight: "bold"}}>{form.name}</Text> and all its
              transaction history. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={handleDeleteConfirm}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!activeError}
        onDismiss={() => {}}
        duration={3000}
        style={{backgroundColor: colors.errorContainer}}
      >
        <Text variant="bodySmall" style={{color: colors.onErrorContainer}}>
          {activeError}
        </Text>
      </Snackbar>
    </View>
  );
};

export default WalletForm;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: "space-between"},
  fields: {gap: 4, marginTop: 8},
  submitButton: {paddingVertical: 4},
  dialogTitle: {textAlign: "center"},
});
