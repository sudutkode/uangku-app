import {useFetch, useMutation} from "@/hooks/axios";
import {useTransactionsStore, useWalletsStore} from "@/store";
import {
  MutationTransactionResponse,
  TransactionResponse,
  WalletsResponse,
} from "@/types";
import {useRouter} from "expo-router";
import {useEffect, useMemo, useRef, useState} from "react";
import {Animated, PanResponder} from "react-native";
import {
  FormState,
  NOTIFICATION_CATEGORY_NAME,
  TRANSFER_TYPE_ID,
} from "./constants";

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

export function useTransactionForm(id?: string) {
  const router = useRouter();

  const setNeedsRefetchWallets = useWalletsStore((s) => s.setNeedsRefetch);
  const setNeedsRefetchTransactions = useTransactionsStore(
    (s) => s.setNeedsRefetch,
  );

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeFieldRef = useRef<"amount" | "adminFee">("amount");
  const [activeFieldDisplay, setActiveFieldDisplay] = useState<
    "amount" | "adminFee"
  >("amount");

  // ─── animation ───
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
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

  // ─── fetch ───
  const {data: existingData, loading: loadingExisting} =
    useFetch<TransactionResponse>(`/transactions/${id}`, {}, !id);
  const isNotification =
    existingData?.data.transactionCategory.name === NOTIFICATION_CATEGORY_NAME;

  const {data: walletsData} = useFetch<WalletsResponse>("/wallets");

  const {
    mutate: mutateTransaction,
    loading: loadingTransaction,
    error: saveError,
  } = useMutation<MutationTransactionResponse, FormState>(
    id ? `/transactions/${id}` : "/transactions",
    {method: id ? "patch" : "post"},
  );

  const {
    mutate: deleteTransaction,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/transactions/${id}`, {method: "delete"});

  // ─── sync existing ───
  useEffect(() => {
    if (!existingData) return;

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
    if (d.note) setShowNote(true);
  }, [existingData]);

  const walletOptions = useMemo(() => {
    const wallets = walletsData?.data ?? [];
    return wallets.map((w) => ({
      label: w.name,
      value: String(w.id),
    }));
  }, [walletsData]);

  const targetWalletOptions = useMemo(
    () => walletOptions.filter((w) => Number(w.value) !== form.walletId),
    [walletOptions, form.walletId],
  );

  const isTransfer = form.transactionTypeId === TRANSFER_TYPE_ID;
  const isEdit = !!id;

  const saveDisabled =
    !form.amount || !form.walletId || (isTransfer && !form.targetWalletId);

  useEffect(() => {
    if (saveError || deleteError) {
      setErrorMessage(saveError || deleteError || null);
    }
  }, [saveError, deleteError]);

  // ─── actions ───
  const refetchData = () => {
    setNeedsRefetchWallets(true);
    setNeedsRefetchTransactions(true);
  };

  const handleSave = async () => {
    try {
      await mutateTransaction(form);
      refetchData();
      router.back();
    } catch {}
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    try {
      await deleteTransaction({});
      refetchData();
      router.back();
    } catch {}
  };

  const handleKeyPress = (val: string) => {
    setForm((prev) => {
      const field = activeFieldRef.current;
      const current = prev[field].toString();

      if (val === "backspace") {
        const newVal = current.length <= 1 ? "0" : current.slice(0, -1);
        return {...prev, [field]: Number(newVal)};
      }

      const newVal = current === "0" ? val : current + val;
      if (newVal.length > 12) return prev;

      return {...prev, [field]: Number(newVal)};
    });
  };

  const handleFieldPress = (field: "amount" | "adminFee") => {
    activeFieldRef.current = field;
    setActiveFieldDisplay(field);
  };

  return {
    form,
    setForm,
    modalVisible,
    setModalVisible,
    showDeleteDialog,
    setShowDeleteDialog,
    showNote,
    setShowNote,
    walletOptions,
    targetWalletOptions,
    isTransfer,
    isEdit,
    loadingExisting,
    loadingTransaction,
    loadingDelete,
    activeFieldDisplay,
    errorMessage,
    setErrorMessage,
    panResponder,
    translateY,
    handleSave,
    handleDeleteConfirm,
    handleKeyPress,
    handleFieldPress,
    saveDisabled,
    isNotification,
  };
}
