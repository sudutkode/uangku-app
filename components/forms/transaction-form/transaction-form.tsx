import {useFetch} from "@/hooks/axios/use-fetch";
import {useMutation} from "@/hooks/axios/use-mutation";
import {useTransactionsStore} from "@/store";
import {
  MutationTransactionResponse,
  TransactionResponse,
  WalletsResponse,
} from "@/types";
import {Stack, useRouter} from "expo-router";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {
  ActivityIndicator,
  Button,
  Modal,
  Portal,
  useTheme,
} from "react-native-paper";
import {FormState, TRANSFER_TYPE_ID} from "./constants";
import TransactionCategoryPicker from "./transaction-category-picker";
import TransactionDisplay, {ActiveField} from "./transaction-display";
import TransactionFields from "./transaction-fields";
import TransactionKeypad from "./transaction-keypad";

const INITIAL_FORM = {
  transactionTypeId: 1,
  transactionCategoryId: 0,
  walletId: 0,
  targetWalletId: 0,
  amount: 0,
  adminFee: 0,
  createdAt: new Date(),
};

export default function TransactionForm({id}: {id?: string}) {
  const {colors} = useTheme();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [modalVisible, setModalVisible] = useState(false);

  // Ref keeps the active field stable so handleKeyPress has zero deps.
  const activeFieldRef = useRef<ActiveField>("amount");
  const [activeFieldDisplay, setActiveFieldDisplay] =
    useState<ActiveField>("amount");

  const {setNeedsRefetch} = useTransactionsStore();

  const {data: existingData, loading: loadingOldData} =
    useFetch<TransactionResponse>(`/transactions/${id}`, {}, !id);

  useEffect(() => {
    if (existingData) {
      const d = existingData.data;
      setForm({
        transactionTypeId: d.transactionType.id,
        transactionCategoryId: d.transactionCategory.id,
        walletId: d.transactionWallets[0]?.wallet?.id || 0,
        targetWalletId: d.transactionWallets[1]?.wallet?.id || 0,
        amount: d.amount,
        adminFee: d.adminFee,
        createdAt: new Date(d.createdAt),
      });
      setModalVisible(true);
    }
  }, [existingData]);

  const {mutate: mutateTransaction, loading: loadingTransaction} = useMutation<
    MutationTransactionResponse,
    FormState
  >(id ? `transactions/${id}` : "transactions", {
    method: id ? "patch" : "post",
    config: {params: id ? {id} : undefined},
  });

  const {mutate: deleteTransaction, loading: loadingDelete} = useMutation(
    `transactions/${id}`,
    {
      method: "delete",
    },
  );

  const {data} = useFetch<WalletsResponse>("wallets");
  const wallets = data?.data;

  const walletOptions = useMemo(() => {
    if (!wallets) return [];
    return wallets.map((w) => ({label: w.name, value: String(w.id)}));
  }, [wallets]);

  const targetWalletOptions = useMemo(
    () => walletOptions.filter((w) => Number(w.value) !== form.walletId),
    [walletOptions, form.walletId],
  );

  const handleKeyPress = useCallback((val: string) => {
    setForm((prev) => {
      const field = activeFieldRef.current;
      const currentVal = prev[field].toString();

      if (val === "backspace") {
        const newVal = currentVal.length <= 1 ? "0" : currentVal.slice(0, -1);
        return {...prev, [field]: Number(newVal)};
      }

      const newVal = currentVal === "0" ? val : currentVal + val;
      if (newVal.length <= 12) {
        return {...prev, [field]: Number(newVal)};
      }
      return prev;
    });
  }, []);

  if (loadingOldData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleFieldPress = (field: ActiveField) => {
    activeFieldRef.current = field;
    setActiveFieldDisplay(field);
  };

  const handleDismiss = () => setModalVisible(false);

  const handleSave = async () => {
    await mutateTransaction(form);
    setModalVisible(false);
    setNeedsRefetch(true);
    router.back();
  };

  const handleTypeChange = (typeId: number) => {
    setForm({
      ...INITIAL_FORM,
      transactionTypeId: typeId,
      createdAt: new Date(),
    });
  };

  const handleCategoryChange = (catId: number) => {
    setForm((p) => ({...p, transactionCategoryId: catId}));
    setModalVisible(true);
    handleFieldPress("amount");
  };

  const isTransfer = form.transactionTypeId === TRANSFER_TYPE_ID;
  const isEdit = !!id;

  const saveDisabled =
    !form.amount || !form.walletId || (isTransfer && !form.targetWalletId);

  const handleDelete = async () => {
    await deleteTransaction({});
    setNeedsRefetch(true);
    router.back();
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <Stack.Screen
        options={{
          headerRight: () =>
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
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TransactionCategoryPicker
          transactionTypeId={form.transactionTypeId}
          transactionCategoryId={form.transactionCategoryId}
          onTypeChange={handleTypeChange}
          onCategoryChange={handleCategoryChange}
        />
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleDismiss}
          contentContainerStyle={[
            styles.modalContent,
            {backgroundColor: colors.surface},
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.formContainer}>
            <TransactionFields
              form={form}
              setForm={setForm}
              walletOptions={walletOptions}
              targetWalletOptions={targetWalletOptions}
            />

            <TransactionDisplay
              amount={form.amount}
              adminFee={form.adminFee}
              activeField={activeFieldDisplay}
              isTransfer={isTransfer}
              onFieldPress={handleFieldPress}
            />
          </View>

          <TransactionKeypad
            onKeyPress={handleKeyPress}
            onSave={handleSave}
            saveDisabled={saveDisabled}
            isEdit={isEdit}
            loading={loadingTransaction}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  scrollContainer: {padding: 16, paddingBottom: 60},
  modalContent: {
    marginTop: "auto",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    overflow: "hidden",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D1D1",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  formContainer: {paddingHorizontal: 20, marginBottom: 15},
});
