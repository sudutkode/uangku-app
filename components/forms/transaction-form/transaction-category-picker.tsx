import {ErrorState, Icon, LoadingState} from "@/components/ui";
import {useFetch, useMutation} from "@/hooks/axios";
import useTransactionCategoriesStore from "@/store/use-transaction-categories";
import {TransactionCategoriesResponse} from "@/types";
import React, {memo, useCallback, useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  SegmentedButtons,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import TransactionCategoryFormSheet, {
  TransactionCategoryFormData,
} from "./transaction-category-form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionCategoryPickerProps {
  transactionTypeId: number;
  transactionCategoryId: number;
  onTypeChange: (typeId: number) => void;
  onCategoryChange: (catId: number) => void;
  isNotification: boolean;
}

// ─── CategoryItem ─────────────────────────────────────────────────────────────

interface CategoryItemProps {
  id: number;
  name: string;
  iconName: string;
  isSelected: boolean;
  transactionTypeId: number;
  onPress: (id: number) => void;
  onLongPress: (data: TransactionCategoryFormData) => void;
}

const CategoryItem = memo(
  ({
    id,
    name,
    iconName,
    isSelected,
    transactionTypeId,
    onPress,
    onLongPress,
  }: CategoryItemProps) => {
    const {colors} = useTheme();

    const handlePress = useCallback(() => onPress(id), [id, onPress]);
    const handleLongPress = useCallback(
      () => onLongPress({id, name, iconName, transactionTypeId}),
      [id, name, iconName, transactionTypeId, onLongPress],
    );

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={styles.categoryItem}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isSelected
                ? colors.primary
                : colors.surfaceVariant,
            },
          ]}
        >
          <Icon
            name={iconName || "circle"}
            size={20}
            color={isSelected ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </View>
        <Text variant="labelSmall" style={styles.catLabel} numberOfLines={2}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  },
);
CategoryItem.displayName = "CategoryItem";

// ─── AddCategoryItem ──────────────────────────────────────────────────────────

const AddCategoryItem = memo(({onPress}: {onPress: () => void}) => {
  const {colors} = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.categoryItem}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceVariant,
            borderWidth: 1.5,
            borderColor: colors.outline,
            borderStyle: "dashed",
          },
        ]}
      >
        <Icon name="plus" size={20} color={colors.outline} />
      </View>
      <Text
        variant="labelSmall"
        style={[styles.catLabel, {color: colors.outline}]}
      >
        Tambah
      </Text>
    </TouchableOpacity>
  );
});
AddCategoryItem.displayName = "AddCategoryItem";

// ─── Main component ───────────────────────────────────────────────────────────

const TransactionCategoryPicker = ({
  transactionTypeId,
  transactionCategoryId,
  onTypeChange,
  onCategoryChange,
  isNotification,
}: TransactionCategoryPickerProps) => {
  const {colors} = useTheme();

  // Zustand Store
  const categories = useTransactionCategoriesStore(
    (s) => s.transactionCategories,
  );
  const needsRefetch = useTransactionCategoriesStore((s) => s.needsRefetch);
  const setCategoriesData = useTransactionCategoriesStore(
    (s) => s.setTransactionCategoriesData,
  );
  const setNeedsRefetch = useTransactionCategoriesStore(
    (s) => s.setNeedsRefetch,
  );

  const [formVisible, setFormVisible] = useState(false);
  const [editData, setEditData] = useState<TransactionCategoryFormData | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<TransactionCategoryFormData | null>(null);

  // Logic skip fetch jika data sudah ada di store dan tidak butuh refetch
  const shouldSkip = categories.length > 0 && !needsRefetch;

  const {data, loading, error} = useFetch<TransactionCategoriesResponse>(
    "/transaction-categories",
    {
      params: {withNotification: isNotification},
    },
    shouldSkip,
  );

  // Sinkronisasi data API ke Store
  useEffect(() => {
    if (data?.data) {
      setCategoriesData(data.data);
      setNeedsRefetch(false);
    }
  }, [data, setCategoriesData, setNeedsRefetch]);

  const {
    mutate: deleteCategory,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/transaction-categories/${deleteTarget?.id}`, {
    method: "delete",
  });

  const filtered = categories.filter(
    (c) => c.transactionType.id === transactionTypeId,
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleTypeChange = useCallback(
    (val: string) => onTypeChange(Number(val)),
    [onTypeChange],
  );

  const handleAddPress = useCallback(() => {
    setEditData(null);
    setFormVisible(true);
  }, []);

  const handleLongPress = useCallback((data: TransactionCategoryFormData) => {
    setEditData(data);
    setFormVisible(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setNeedsRefetch(true); // Memaksa re-hit API pada render berikutnya
    setFormVisible(false);
  }, [setNeedsRefetch]);

  const handleDeleteRequest = useCallback(
    (data: TransactionCategoryFormData) => {
      setFormVisible(false);
      setDeleteTarget(data);
    },
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory({});
      if (deleteTarget.id === transactionCategoryId) {
        onCategoryChange(0);
      }
      setDeleteTarget(null);
      setNeedsRefetch(true); // Memaksa re-hit API untuk update store
    } catch {
      // error ditampilkan via Snackbar di bawah
    }
  }, [
    deleteTarget,
    deleteCategory,
    transactionCategoryId,
    onCategoryChange,
    setNeedsRefetch,
  ]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View>
      <SegmentedButtons
        value={String(transactionTypeId)}
        onValueChange={handleTypeChange}
        buttons={[
          {value: "1", label: "Masuk", icon: "plus"},
          {value: "2", label: "Keluar", icon: "minus"},
          {value: "3", label: "Transfer", icon: "swap-horizontal"},
        ]}
      />

      {loading && categories.length === 0 ? (
        <View style={styles.stateContainer}>
          <LoadingState message="Memuat kategori..." />
        </View>
      ) : error && categories.length === 0 ? (
        <View style={styles.stateContainer}>
          <ErrorState message="Gagal memuat kategori" />
        </View>
      ) : (
        <View style={styles.grid}>
          {filtered.map((cat) => (
            <CategoryItem
              key={cat.id}
              id={cat.id}
              name={cat.name}
              iconName={cat.iconName || ""}
              isSelected={transactionCategoryId === cat.id}
              transactionTypeId={transactionTypeId}
              onPress={onCategoryChange}
              onLongPress={handleLongPress}
            />
          ))}
          <AddCategoryItem onPress={handleAddPress} />
        </View>
      )}

      {/* Form Create / Edit */}
      <TransactionCategoryFormSheet
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
        onDeleteRequest={handleDeleteRequest}
        transactionTypeId={transactionTypeId}
        editData={editData}
      />

      {/* Dialog Konfirmasi Hapus */}
      <Portal>
        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={styles.dialogTitle}>
            Hapus kategori?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Hapus kategori{" "}
              <Text style={{fontWeight: "bold"}}>{deleteTarget?.name}</Text>?
              Transaksi dengan kategori ini akan menjadi tidak diketahui.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Batal</Button>
            <Button
              textColor={colors.error}
              onPress={handleDeleteConfirm}
              loading={loadingDelete}
            >
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={!!deleteError}
          onDismiss={() => {}}
          duration={3000}
          style={{backgroundColor: colors.errorContainer}}
        >
          <Text variant="bodySmall" style={{color: colors.onErrorContainer}}>
            {deleteError}
          </Text>
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  stateContainer: {
    height: 160,
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  catLabel: {
    textAlign: "center",
  },
  dialogTitle: {
    textAlign: "center",
  },
});

export default TransactionCategoryPicker;
