import {ErrorState, Icon, LoadingState} from "@/components/ui";
import {useFetch, useMutation} from "@/hooks/axios";
import {TransactionCategoriesResponse} from "@/types";
import React, {memo, useCallback, useState} from "react";
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
        Add
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
}: TransactionCategoryPickerProps) => {
  const {colors} = useTheme();

  const [formVisible, setFormVisible] = useState(false);
  const [editData, setEditData] = useState<TransactionCategoryFormData | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<TransactionCategoryFormData | null>(null);

  const {data, loading, error, refetch} =
    useFetch<TransactionCategoriesResponse>("/transaction-categories");

  const {
    mutate: deleteCategory,
    loading: loadingDelete,
    error: deleteError,
  } = useMutation(`/transaction-categories/${deleteTarget?.id}`, {
    method: "delete",
  });

  const categories = data?.data?.data ?? [];
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

  // Long press on category → show edit form
  // From edit form, user can choose to delete instead
  const handleLongPress = useCallback((data: TransactionCategoryFormData) => {
    setEditData(data);
    setFormVisible(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

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
      refetch();
    } catch {
      // error shown via Snackbar
    }
  }, [
    deleteTarget,
    deleteCategory,
    transactionCategoryId,
    onCategoryChange,
    refetch,
  ]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View>
      <SegmentedButtons
        value={String(transactionTypeId)}
        onValueChange={handleTypeChange}
        buttons={[
          {value: "1", label: "Income", icon: "plus"},
          {value: "2", label: "Expense", icon: "minus"},
          {value: "3", label: "Transfer", icon: "swap-horizontal"},
        ]}
      />

      {loading ? (
        <View style={styles.stateContainer}>
          <LoadingState message="Loading categories..." />
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <ErrorState message="Failed to load categories" />
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

      {/* Create / edit form */}
      <TransactionCategoryFormSheet
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
        onDeleteRequest={handleDeleteRequest}
        transactionTypeId={transactionTypeId}
        editData={editData}
      />

      {/* Delete confirmation */}
      <Portal>
        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={styles.dialogTitle}>
            Delete category?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Delete{" "}
              <Text style={{fontWeight: "bold"}}>{deleteTarget?.name}</Text>?
              Transactions using this category will be moved to Unknown.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              textColor={colors.error}
              onPress={handleDeleteConfirm}
              loading={loadingDelete}
            >
              Delete
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

export default TransactionCategoryPicker;

// ─── Styles ───────────────────────────────────────────────────────────────────

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
