import {useFetch} from "@/hooks/axios/use-fetch";
import {useMutation} from "@/hooks/axios/use-mutation";
import {useWalletsStore} from "@/store";
import {Wallet} from "@/types";
import {formatIdr} from "@/utils/common-utils";
import {Stack, useRouter} from "expo-router";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {
  ActivityIndicator,
  Button,
  TextInput,
  useTheme,
} from "react-native-paper";

interface WalletFormProps {
  id?: string;
}

interface FormState {
  name: string;
  balance: number;
}

const INITIAL_FORM: FormState = {
  name: "",
  balance: 0,
};

const WalletForm: FC<WalletFormProps> = ({id}) => {
  const {colors} = useTheme();
  const router = useRouter();
  const setNeedsRefetch = useWalletsStore((state) => state.setNeedsRefetch);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Memoize URL params to prevent unnecessary hook triggers
  const fetchConfig = useMemo(() => ({}), []);
  const {data: existingData, loading: loadingOldData} = useFetch<{
    data: Wallet;
  }>(`/wallets/${id}`, fetchConfig, !id);

  const {mutate: mutateWallet, loading: loadingSubmit} = useMutation<any, any>(
    id ? `/wallets/${id}` : "/wallets",
    {method: id ? "patch" : "post"},
  );

  const {mutate: deleteWallet, loading: loadingDelete} = useMutation(
    `wallets/${id}`,
    {method: "delete"},
  );

  // Sync data from API
  useEffect(() => {
    if (existingData?.data) {
      setForm({
        name: existingData.data.name,
        balance: existingData.data.balance,
      });
    }
  }, [existingData]);

  // Memoize handlers to prevent recreation on every keystroke
  const handleNameChange = useCallback((val: string) => {
    setForm((prev) => ({...prev, name: val}));
  }, []);

  const handleBalanceChange = useCallback((val: string) => {
    const numericValue = val.replace(/[^0-9]/g, "");
    setForm((prev) => ({...prev, balance: Number(numericValue) || 0}));
  }, []);

  const handleDelete = useCallback(async () => {
    await deleteWallet({});
    setNeedsRefetch(true);
    router.back();
  }, [deleteWallet, router, setNeedsRefetch]);

  const handleSave = useCallback(async () => {
    await mutateWallet(form);
    setNeedsRefetch(true);
    router.back();
  }, [form, mutateWallet, router, setNeedsRefetch]);

  // Memoize Header Button to prevent header re-renders on typing
  const headerRight = useCallback(
    () =>
      id ? (
        <Button
          textColor={colors.error}
          onPress={handleDelete}
          loading={loadingDelete}
          disabled={!existingData || loadingDelete}
        >
          Delete
        </Button>
      ) : null,
    [id, colors.error, handleDelete, loadingDelete, existingData],
  );

  if (loadingOldData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Stack.Screen options={{headerRight}} />

      <View style={styles.inputsContainer}>
        <TextInput
          mode="outlined"
          label="Name"
          value={form.name}
          onChangeText={handleNameChange}
          activeOutlineColor={colors.primary}
        />

        <TextInput
          mode="outlined"
          label="Balance"
          value={formatIdr(form.balance)}
          onChangeText={handleBalanceChange}
          keyboardType="numeric"
          activeOutlineColor={colors.primary}
          placeholder="Rp 0"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loadingSubmit}
        disabled={loadingSubmit || !form.name}
      >
        {id ? "Update" : "Save"}
      </Button>
    </View>
  );
};

export default WalletForm;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: "space-between"},
  center: {flex: 1, justifyContent: "center", alignItems: "center"},
  inputsContainer: {gap: 16, marginTop: 10},
});
