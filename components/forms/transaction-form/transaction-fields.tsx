import {DatePicker, Dropdown} from "@/components/inputs";
import React, {memo, useCallback} from "react";
import {StyleSheet, View} from "react-native";
import {HelperText, TextInput, useTheme} from "react-native-paper";
import {FormState, TRANSFER_TYPE_ID} from "./constants";

interface TransactionFieldsProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  walletOptions: {label: string; value: string}[];
  targetWalletOptions: {label: string; value: string}[];
  isAutoImported?: boolean;
}

const TransactionFields = memo(
  ({
    form,
    setForm,
    walletOptions,
    targetWalletOptions,
    isAutoImported = false,
  }: TransactionFieldsProps) => {
    const {colors} = useTheme();

    const handleWalletChange = useCallback(
      (val?: string) => setForm((p) => ({...p, walletId: Number(val)})),
      [setForm],
    );

    const handleTargetWalletChange = useCallback(
      (val?: string) => setForm((p) => ({...p, targetWalletId: Number(val)})),
      [setForm],
    );

    const handleDateChange = useCallback(
      (date?: Date) => setForm((p) => ({...p, createdAt: date ?? new Date()})),
      [setForm],
    );

    const handleNoteChange = useCallback(
      (val: string) => setForm((p) => ({...p, note: val || null})),
      [setForm],
    );

    return (
      <>
        <View style={styles.row}>
          <View style={styles.walletCol}>
            <Dropdown
              label="Wallet"
              value={form.walletId.toString()}
              onSelect={handleWalletChange}
              options={walletOptions}
            />
          </View>
          <View style={styles.dateCol}>
            <DatePicker
              label="Date"
              value={form.createdAt}
              onChange={handleDateChange}
            />
          </View>
        </View>

        {form.transactionTypeId === TRANSFER_TYPE_ID && (
          <View style={styles.spacing}>
            <Dropdown
              label="Recipient Wallet"
              value={form.targetWalletId.toString()}
              onSelect={handleTargetWalletChange}
              options={targetWalletOptions}
            />
          </View>
        )}

        {/* Note field — editable for manual transactions, read-only for auto-imports */}
        <View style={styles.spacing}>
          {isAutoImported ? (
            // Auto-imported: read-only, shows the raw notification text
            <>
              <TextInput
                mode="outlined"
                label="Note (auto-imported)"
                value={form.note ?? ""}
                editable={false}
                multiline
                activeOutlineColor={colors.outline}
                outlineColor={colors.outlineVariant}
                style={{backgroundColor: colors.surfaceVariant}}
                textColor={colors.onSurfaceVariant}
              />
              <HelperText type="info" visible>
                Recorded from notification — not editable
              </HelperText>
            </>
          ) : (
            // Manual transaction: optional free-text note
            <TextInput
              mode="outlined"
              label="Note (optional)"
              value={form.note ?? ""}
              onChangeText={handleNoteChange}
              multiline
              numberOfLines={2}
              activeOutlineColor={colors.primary}
              placeholder="e.g. Lunch with team, Monthly rent..."
            />
          )}
        </View>
      </>
    );
  },
);

TransactionFields.displayName = "TransactionFields";
export default TransactionFields;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  walletCol: {flex: 1.2, marginRight: 8},
  dateCol: {flex: 1},
  spacing: {marginBottom: 12},
});
