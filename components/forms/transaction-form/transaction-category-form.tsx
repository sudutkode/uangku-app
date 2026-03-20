import {Icon} from "@/components/ui";
import {useMutation} from "@/hooks/axios";
import React, {memo, useCallback, useEffect, useState} from "react";
import {FlatList, StyleSheet, TouchableOpacity} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

// ─── Icon options ─────────────────────────────────────────────────────────────
// Common FA6 icons suitable for transaction categories
const ICON_OPTIONS = [
  "utensils",
  "car",
  "house",
  "heart",
  "shirt",
  "graduation-cap",
  "plane",
  "dumbbell",
  "gamepad",
  "music",
  "dog",
  "baby",
  "briefcase",
  "gift",
  "coffee",
  "pizza-slice",
  "bus",
  "bolt",
  "wifi",
  "tv",
  "phone",
  "shopping-bag",
  "hospital",
  "wallet",
  "money-bill",
  "piggy-bank",
  "chart-line",
  "receipt",
  "tag",
  "circle",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionCategoryFormData {
  id?: number;
  name: string;
  iconName: string;
  transactionTypeId: number;
}

interface TransactionCategoryFormSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  onDeleteRequest?: (data: TransactionCategoryFormData) => void;
  transactionTypeId: number;
  editData?: TransactionCategoryFormData | null;
}

// ─── Icon picker item ─────────────────────────────────────────────────────────

const IconOption = memo(
  ({
    name,
    isSelected,
    onPress,
  }: {
    name: string;
    isSelected: boolean;
    onPress: (name: string) => void;
  }) => {
    const {colors} = useTheme();
    const handlePress = useCallback(() => onPress(name), [name, onPress]);
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.iconOption,
          {
            backgroundColor: isSelected
              ? colors.primary
              : colors.surfaceVariant,
          },
        ]}
      >
        <Icon
          name={name}
          size={18}
          color={isSelected ? colors.onPrimary : colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  },
);
IconOption.displayName = "IconOption";

// ─── Main component ───────────────────────────────────────────────────────────

const TransactionCategoryFormSheet = ({
  visible,
  onDismiss,
  onSuccess,
  onDeleteRequest,
  transactionTypeId,
  editData,
}: TransactionCategoryFormSheetProps) => {
  const {colors} = useTheme();
  const isEdit = !!editData?.id;

  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("tag");
  const [nameError, setNameError] = useState("");

  // Sync form when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setIconName(editData.iconName || "tag");
    } else {
      setName("");
      setIconName("tag");
    }
    setNameError("");
  }, [editData, visible]);

  const {
    mutate: createCategory,
    loading: loadingCreate,
    error: createError,
  } = useMutation("/transaction-categories", {method: "post"});

  const {
    mutate: updateCategory,
    loading: loadingUpdate,
    error: updateError,
  } = useMutation(`/transaction-categories/${editData?.id}`, {method: "patch"});

  const loading = loadingCreate || loadingUpdate;
  const error = createError || updateError;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }
    try {
      if (isEdit) {
        await updateCategory({name: name.trim(), iconName, transactionTypeId});
      } else {
        await createCategory({
          name: name.trim(),
          iconName,
          transactionTypeId,
        });
      }
      onSuccess();
      onDismiss();
    } catch {
      // error shown via Snackbar
    }
  }, [
    name,
    iconName,
    transactionTypeId,
    isEdit,
    createCategory,
    updateCategory,
    onSuccess,
    onDismiss,
  ]);

  const handleNameChange = useCallback((val: string) => {
    setName(val);
    if (val.trim()) setNameError("");
  }, []);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{isEdit ? "Edit Category" : "New Category"}</Dialog.Title>

        <Dialog.Content style={styles.dialogContent}>
          {/* Name input */}
          <TextInput
            mode="outlined"
            label="Category name"
            value={name}
            onChangeText={handleNameChange}
            error={!!nameError}
            activeOutlineColor={nameError ? colors.error : colors.primary}
            autoCapitalize="words"
            style={styles.nameInput}
          />
          {!!nameError && (
            <Text
              variant="labelSmall"
              style={[styles.errorText, {color: colors.error}]}
            >
              {nameError}
            </Text>
          )}

          {/* Icon picker */}
          <Text
            variant="labelMedium"
            style={[styles.iconLabel, {color: colors.onSurfaceVariant}]}
          >
            Icon
          </Text>
          <FlatList
            data={ICON_OPTIONS}
            keyExtractor={(item) => item}
            numColumns={6}
            scrollEnabled={false}
            renderItem={({item}) => (
              <IconOption
                name={item}
                isSelected={iconName === item}
                onPress={setIconName}
              />
            )}
            contentContainerStyle={styles.iconGrid}
          />
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          {isEdit && onDeleteRequest && (
            <Button
              textColor={colors.error}
              onPress={() => editData && onDeleteRequest(editData)}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={3000}
        style={{backgroundColor: colors.errorContainer}}
      >
        <Text variant="bodySmall" style={{color: colors.onErrorContainer}}>
          {error}
        </Text>
      </Snackbar>
    </Portal>
  );
};

export default TransactionCategoryFormSheet;

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "80%",
  },
  actions: {
    justifyContent: "space-between",
  },
  dialogContent: {
    paddingBottom: 0,
  },
  nameInput: {
    marginBottom: 4,
  },
  errorText: {
    marginBottom: 8,
    marginLeft: 4,
  },
  iconLabel: {
    marginTop: 12,
    marginBottom: 8,
  },
  iconGrid: {
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
});
