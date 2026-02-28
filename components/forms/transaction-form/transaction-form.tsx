import {useFetch} from "@/hooks/axios/use-fetch";
import {useMutation} from "@/hooks/axios/use-mutation";
import {MutationTransactionResponse, WalletsResponse} from "@/types";
import {useRouter} from "expo-router";
import React, {useCallback, useMemo, useRef, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {Modal, Portal, useTheme} from "react-native-paper";
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
  const theme = useTheme();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [modalVisible, setModalVisible] = useState(false);

  const {mutate: mutateTransaction, loading: loadingTransaction} = useMutation<
    MutationTransactionResponse,
    FormState
  >("transactions", {
    method: id ? "put" : "post",
    config: {params: id ? {id} : undefined},
  });

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

  // Ref keeps the active field stable so handleKeyPress has zero deps.
  const activeFieldRef = useRef<ActiveField>("amount");
  const [activeFieldDisplay, setActiveFieldDisplay] =
    useState<ActiveField>("amount");

  const isTransfer = form.transactionTypeId === TRANSFER_TYPE_ID;
  const isEdit = !!id;

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

  const handleFieldPress = (field: ActiveField) => {
    activeFieldRef.current = field;
    setActiveFieldDisplay(field);
  };

  const handleDismiss = () => setModalVisible(false);

  const handleSave = async () => {
    await mutateTransaction(form);
    setModalVisible(false);
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

  const saveDisabled =
    !form.amount || !form.walletId || (isTransfer && !form.targetWalletId);

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
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
            {backgroundColor: theme.colors.surface},
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
