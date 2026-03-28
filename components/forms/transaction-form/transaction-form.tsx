import {LoadingState, Snackbar} from "@/components/ui";
import {Stack} from "expo-router";
import React from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {
  Button,
  Dialog,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

import TransactionCategoryPicker from "./transaction-category-picker";
import TransactionDisplay from "./transaction-display";
import TransactionFields from "./transaction-fields";
import TransactionKeypad from "./transaction-keypad";
import {useTransactionForm} from "./use-transaction-form";

export default function TransactionForm({id}: {id?: string}) {
  const {colors} = useTheme();
  const vm = useTransactionForm(id);

  if (vm.loadingExisting) {
    return <LoadingState message="Loading transaction..." />;
  }

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Stack.Screen
        options={{
          title: vm.isEdit ? "Detail Transaksi" : "Transaksi Baru",
          headerRight: () =>
            vm.isEdit ? (
              <Button
                textColor={colors.error}
                onPress={() => vm.setShowDeleteDialog(true)}
                disabled={vm.loadingDelete}
                loading={vm.loadingDelete}
              >
                Hapus
              </Button>
            ) : null,
        }}
      />

      {/* CATEGORY */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <TransactionCategoryPicker
          transactionTypeId={vm.form.transactionTypeId}
          transactionCategoryId={vm.form.transactionCategoryId}
          onTypeChange={(typeId) => {
            vm.setForm((p) => ({
              ...p,
              transactionTypeId: typeId,
              transactionCategoryId: 0,
            }));
          }}
          onCategoryChange={(catId) => {
            vm.setForm((p) => ({...p, transactionCategoryId: catId}));
            vm.setModalVisible(true);
            vm.handleFieldPress("amount");
          }}
          isNotification={vm.isNotification}
        />
      </ScrollView>

      {/* MODAL */}
      <Portal>
        <Modal
          visible={vm.modalVisible}
          onDismiss={() => vm.setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            {
              backgroundColor: colors.surface,
              transform: [{translateY: vm.translateY}],
            },
          ]}
        >
          {/* DRAG HANDLE */}
          <View {...vm.panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.dragHandle} />
          </View>

          {/* FIELDS */}
          <ScrollView style={styles.fields} keyboardShouldPersistTaps="handled">
            <TransactionFields
              form={vm.form}
              setForm={vm.setForm}
              walletOptions={vm.walletOptions}
              targetWalletOptions={vm.targetWalletOptions}
              isNotification={vm.isNotification}
            />
          </ScrollView>

          {/* DISPLAY */}
          <TransactionDisplay
            amount={vm.form.amount}
            adminFee={vm.form.adminFee}
            activeField={vm.activeFieldDisplay}
            isTransfer={vm.isTransfer}
            onFieldPress={vm.handleFieldPress}
          />

          {/* KEYPAD */}
          <TransactionKeypad
            onKeyPress={vm.handleKeyPress}
            onSave={vm.handleSave}
            saveDisabled={vm.saveDisabled}
            loading={vm.loadingTransaction}
          />
        </Modal>

        {/* DELETE */}
        <Dialog
          visible={vm.showDeleteDialog}
          onDismiss={() => vm.setShowDeleteDialog(false)}
        >
          <Dialog.Title>Delete transaction?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => vm.setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onPress={vm.handleDeleteConfirm}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={vm.showDeleteDialog}
          onDismiss={() => vm.setShowDeleteDialog(false)}
        >
          <Dialog.Icon icon="alert" color={colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>
            Hapus transaksi?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Ini akan menghapus secara permanen transaksi ini. Tindakan ini
              tidak dapat dibatalkan.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => vm.setShowDeleteDialog(false)}>Batal</Button>
            <Button textColor={colors.error} onPress={vm.handleDeleteConfirm}>
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!vm.errorMessage}
        text={vm.errorMessage || ""}
        onDismiss={() => vm.setErrorMessage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},

  scroll: {
    padding: 16,
    paddingBottom: 60,
  },

  modal: {
    marginTop: "auto",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    overflow: "hidden",
  },

  dragArea: {
    paddingVertical: 10,
    alignItems: "center",
  },

  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D1D1",
    borderRadius: 10,
  },

  fields: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
