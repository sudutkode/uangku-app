import {LoadingState} from "@/components/ui";
import {useFetch, useMutation} from "@/hooks/axios";
import {useTransactionsStore, useWalletsStore} from "@/store";
import {
  MutationTransactionResponse,
  TransactionResponse,
  WalletsResponse,
} from "@/types";
import {Stack, useRouter} from "expo-router";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Modal,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import {
  FormState,
  NOTIFICATION_CATEGORY_NAME,
  TRANSFER_TYPE_ID,
} from "./constants";
import TransactionCategoryPicker from "./transaction-category-picker";
import TransactionDisplay, {ActiveField} from "./transaction-display";
import TransactionFields from "./transaction-fields";
import TransactionKeypad from "./transaction-keypad";

const INITIAL_FORM: FormState = {
  transactionTypeId: 1,
  transactionCategoryId: 0,
  walletId: 0,
  targetWalletId: 0,
  amount: 0,
  adminFee: 0,
  createdAt: new Date(),
  note: null,
};

export default function TransactionForm({id}: {id?: string}) {
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
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const activeFieldRef = useRef<ActiveField>("amount");
  const [activeFieldDisplay, setActiveFieldDisplay] =
    useState<ActiveField>("amount");

  // ─── Swipe to dismiss ──────────────────────────────────────────────────────

  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, {dy}) => dy > 5,
      onPanResponderMove: (_, {dy}) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, {dy, vy}) => {
        if (dy > 80 || vy > 0.8) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setModalVisible(false);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;
  // ─── Data fetching ──────────────────────────────────────────────────────────

  const {data: existingData, loading: loadingExisting} =
    useFetch<TransactionResponse>(`/transactions/${id}`, {}, !id);

  const {data: walletsData} = useFetch<WalletsResponse>("/wallets");
  const wallets = walletsData?.data;

  const {
    mutate: mutateTransaction,
    loading: loadingTransaction,
    error: saveError,
  } = useMutation<MutationTransactionResponse, FormState>(
    id ? `/transactions/${id}` : "/transactions",
    {
      method: id ? "patch" : "post",
      config: {params: id ? {id} : undefined},
    },
  );

  const {
    mutate: deleteTransaction,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/transactions/${id}`, {method: "delete"});

  // ─── Sync existing data ─────────────────────────────────────────────────────

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
        note: d.note ?? null,
      });
      setModalVisible(true);
    }
  }, [existingData]);

  // ─── Derived state ──────────────────────────────────────────────────────────

  const walletOptions = useMemo(
    () => wallets?.map((w) => ({label: w.name, value: String(w.id)})) ?? [],
    [wallets],
  );

  const targetWalletOptions = useMemo(
    () => walletOptions.filter((w) => Number(w.value) !== form.walletId),
    [walletOptions, form.walletId],
  );

  const isTransfer = form.transactionTypeId === TRANSFER_TYPE_ID;
  const isEdit = !!id;
  const isNotification =
    existingData?.data.transactionCategory.name === NOTIFICATION_CATEGORY_NAME;
  const saveDisabled =
    !form.amount || !form.walletId || (isTransfer && !form.targetWalletId);

  const activeError = saveError || deleteError;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleKeyPress = useCallback((val: string) => {
    setForm((prev) => {
      const field = activeFieldRef.current;
      const currentVal = prev[field].toString();
      if (val === "backspace") {
        const newVal = currentVal.length <= 1 ? "0" : currentVal.slice(0, -1);
        return {...prev, [field]: Number(newVal)};
      }
      const newVal = currentVal === "0" ? val : currentVal + val;
      return newVal.length <= 12 ? {...prev, [field]: Number(newVal)} : prev;
    });
  }, []);

  const handleFieldPress = useCallback((field: ActiveField) => {
    activeFieldRef.current = field;
    setActiveFieldDisplay(field);
  }, []);

  const handleDismiss = useCallback(() => setModalVisible(false), []);

  const handleSave = useCallback(async () => {
    try {
      await mutateTransaction(form);
      setModalVisible(false);
      refetchData();
      router.back();
    } catch {
      // error string already set by useMutation, shown via Snackbar
    }
  }, [form, mutateTransaction, router, refetchData]);

  const handleTypeChange = useCallback((typeId: number) => {
    // FIX: only reset category and transfer-specific fields when switching type.
    // wallet, date, amount, note are preserved — user shouldn't lose those
    // just because they switched between Income/Expense/Transfer.
    setForm((prev) => ({
      ...prev,
      transactionTypeId: typeId,
      transactionCategoryId: 0,
      targetWalletId: 0,
      adminFee: 0,
    }));
  }, []);

  const handleCategoryChange = useCallback(
    (catId: number) => {
      setForm((p) => ({...p, transactionCategoryId: catId}));
      setModalVisible(true);
      handleFieldPress("amount");
    },
    [handleFieldPress],
  );

  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteDialog(false);
    try {
      await deleteTransaction({});
      refetchData();
      router.back();
    } catch {
      // error string already set by useMutation, shown via Snackbar
    }
  }, [deleteTransaction, router, refetchData]);

  // ─── Header ──────────────────────────────────────────────────────────────────

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
    return <LoadingState message="Loading transaction..." />;
  }

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Stack.Screen options={{headerRight}} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TransactionCategoryPicker
          isNotification={isNotification}
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
            {backgroundColor: colors.surface, transform: [{translateY}]},
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            style={styles.fieldsScroll}
            contentContainerStyle={styles.fieldsScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TransactionFields
              form={form}
              setForm={setForm}
              walletOptions={walletOptions}
              targetWalletOptions={targetWalletOptions}
              isNotification={isNotification}
            />
          </ScrollView>

          <View style={styles.displayContainer}>
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

        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={styles.dialogTitle}>
            Delete transaction?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This transaction will be permanently deleted and your wallet
              balance will be reversed. This cannot be undone.
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
}

const styles = StyleSheet.create({
  root: {flex: 1},
  scroll: {padding: 16, paddingBottom: 60},
  modalContent: {
    marginTop: "auto",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    overflow: "hidden",
    maxHeight: "85%",
  },
  dragHandleArea: {
    paddingVertical: 10,
    alignItems: "center",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D1D1",
    borderRadius: 10,
  },
  fieldsScroll: {
    flexShrink: 1,
  },
  fieldsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  displayContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dialogTitle: {textAlign: "center"},
});
