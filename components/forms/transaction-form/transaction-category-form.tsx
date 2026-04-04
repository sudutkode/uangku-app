import {Icon} from "@/components/ui";
import {useMutation} from "@/hooks/axios";
import {useIconSearch} from "@/hooks/use-icon-search";
import React, {memo, useCallback, useEffect, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Searchbar,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

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

/**
 * Komponen Item Ikon (Memoized)
 */
const IconOption = memo(
  ({
    name,
    label,
    isSelected,
    onPress,
  }: {
    name: string;
    label: string;
    isSelected: boolean;
    onPress: (name: string) => void;
  }) => {
    const {colors} = useTheme();
    const handlePress = useCallback(() => onPress(name), [name, onPress]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={styles.iconOptionContainer}
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
            name={name}
            size={20}
            color={isSelected ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </View>
        <Text
          variant="labelSmall"
          numberOfLines={2}
          style={[styles.iconLabelText, {color: colors.onSurfaceVariant}]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
);
IconOption.displayName = "IconOption";

/**
 * Form Sheet Utama
 */
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

  // State Lokal
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("tag");

  /**
   * Hook Pencarian Ikon Dinamis
   * Kita kirim editData?.iconName agar Backend menaruh ikon tersebut di urutan teratas (Index 0)
   */
  const {
    icons,
    loading: loadingIcons,
    searchQuery,
    onSearchChange,
    loadMore,
  } = useIconSearch(editData?.iconName);

  // Sinkronisasi data saat modal dibuka atau data edit berubah
  useEffect(() => {
    if (visible) {
      if (editData) {
        setName(editData.name);
        setIconName(editData.iconName || "tag");
      } else {
        setName("");
        setIconName("tag");
      }
      onSearchChange(""); // Reset search query saat modal dibuka
    }
  }, [editData, visible, onSearchChange]);

  // Mutations
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
    try {
      const payload = {
        name: name.trim(),
        iconName,
        transactionTypeId,
      };

      if (isEdit) {
        await updateCategory(payload);
      } else {
        await createCategory(payload);
      }
      onSuccess();
      onDismiss();
    } catch {}
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

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {isEdit ? "Ubah Kategori" : "Kategori Baru"}
        </Dialog.Title>

        <Dialog.Content style={styles.dialogContent}>
          <TextInput
            mode="outlined"
            label="Nama Kategori"
            value={name}
            onChangeText={setName}
            dense
            style={styles.nameInput}
          />

          <View style={styles.headerSearchRow}>
            <Searchbar
              placeholder="Cari ikon (Inggris / Indonesia)..."
              onChangeText={onSearchChange}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={colors.onSurfaceVariant}
              mode="bar"
              elevation={0}
            />
          </View>

          <View style={styles.listWrapper}>
            <FlatList
              data={icons}
              // Gabungkan id dan index untuk key yang benar-benar unik saat sorting berubah
              keyExtractor={(item, index) => `${item.id}-${index}`}
              numColumns={4}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Infinite Scroll Logic
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              renderItem={({item}) => (
                <IconOption
                  name={item.name}
                  label={item.label}
                  isSelected={iconName === item.name}
                  onPress={setIconName}
                />
              )}
              contentContainerStyle={styles.iconGrid}
              // Loading indicator saat tarik data bawah
              ListFooterComponent={
                loadingIcons && icons.length > 0 ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{padding: 10}}
                  />
                ) : (
                  <View style={{height: 20}} />
                )
              }
              ListEmptyComponent={
                !loadingIcons ? (
                  <Text style={styles.emptyText}>Ikon tidak ditemukan</Text>
                ) : (
                  <ActivityIndicator size="large" style={{marginTop: 20}} />
                )
              }
            />
          </View>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <View style={styles.leftActions}>
            {isEdit && onDeleteRequest && (
              <Button
                textColor={colors.error}
                onPress={() => editData && onDeleteRequest(editData)}
                disabled={loading}
              >
                Hapus
              </Button>
            )}
          </View>
          <View style={styles.rightActions}>
            <Button
              textColor={colors.tertiary}
              onPress={onDismiss}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onPress={handleSave}
              loading={loading}
              disabled={loading || !name.trim()}
            >
              Simpan
            </Button>
          </View>
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

export default memo(TransactionCategoryFormSheet);

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "85%",
    borderRadius: 24,
  },
  dialogTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "700",
  },
  dialogContent: {
    paddingBottom: 0,
  },
  nameInput: {
    marginBottom: 4,
    height: 40,
  },
  headerSearchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "transparent",
    marginLeft: -12,
    marginTop: 4,
  },
  searchInput: {
    fontSize: 13,
    minHeight: 0,
  },
  listWrapper: {
    height: 350,
    marginTop: 4,
  },
  iconGrid: {
    paddingBottom: 20,
  },
  iconOptionContainer: {
    flex: 1,
    maxWidth: "25%",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  iconLabelText: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 10,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.5,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  leftActions: {
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    gap: 4,
  },
});
