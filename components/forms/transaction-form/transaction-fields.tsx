import React from "react";
import {StyleSheet, View} from "react-native";
import {DatePickerInput} from "react-native-paper-dates";
import {Dropdown} from "react-native-paper-dropdown";
import {FormState, TRANSFER_TYPE_ID} from "./constants";

interface TransactionFieldsProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  walletOptions: {label: string; value: string}[];
  targetWalletOptions: {label: string; value: string}[];
}

const TransactionFields = React.memo(
  ({
    form,
    setForm,
    walletOptions,
    targetWalletOptions,
  }: TransactionFieldsProps) => {
    const handleWalletChange = (val?: string) =>
      setForm((p) => ({...p, walletId: Number(val)}));

    const handleTargetWalletChange = (val?: string) =>
      setForm((p) => ({...p, targetWalletId: Number(val)}));

    const handleDateChange = (date?: Date) =>
      setForm((p) => ({...p, createdAt: date ?? new Date()}));

    return (
      <>
        <View style={styles.row}>
          <View style={styles.walletCol}>
            <Dropdown
              label="Wallet"
              mode="outlined"
              value={form.walletId.toString()}
              onSelect={handleWalletChange}
              options={walletOptions}
            />
          </View>
          <View style={styles.dateCol}>
            <DatePickerInput
              locale="en"
              label="Date"
              value={form.createdAt}
              onChange={handleDateChange}
              inputMode="start"
              mode="outlined"
            />
          </View>
        </View>

        {form.transactionTypeId === TRANSFER_TYPE_ID && (
          <View style={styles.spacing}>
            <Dropdown
              label="Recipient Wallet"
              mode="outlined"
              value={form.targetWalletId.toString()}
              onSelect={handleTargetWalletChange}
              options={targetWalletOptions}
            />
          </View>
        )}
      </>
    );
  },
);

TransactionFields.displayName = "TransactionFields";

export default TransactionFields;

const styles = StyleSheet.create({
  row: {flexDirection: "row", marginBottom: 12},
  walletCol: {flex: 1.2, marginRight: 8},
  dateCol: {flex: 1},
  spacing: {marginBottom: 12},
});
