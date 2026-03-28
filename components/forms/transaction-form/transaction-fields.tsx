import {DatePicker, Dropdown, Switch} from "@/components/inputs";
import React, {memo, useCallback, useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {TextInput, useTheme} from "react-native-paper";
import {FormState, TRANSFER_TYPE_ID} from "./constants";

interface TransactionFieldsProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  walletOptions: {label: string; value: string}[];
  targetWalletOptions: {label: string; value: string}[];
  isNotification?: boolean;
}

const TransactionFields = memo(
  ({
    form,
    setForm,
    walletOptions,
    targetWalletOptions,
    isNotification = false,
  }: TransactionFieldsProps) => {
    const {colors} = useTheme();
    const [isWithNote, setIsWithNote] = useState(false);

    useEffect(() => {
      if (!isWithNote && form.note) {
        setIsWithNote(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.note]);

    const handleSwitchWithNote = (val: boolean) => {
      setIsWithNote(val);
      if (!val) {
        setForm((p) => ({...p, note: ""}));
      }
    };

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
              label="Dompet"
              value={form.walletId.toString()}
              onSelect={handleWalletChange}
              options={walletOptions}
            />
          </View>
          <View style={styles.dateCol}>
            <DatePicker
              label="Tanggal"
              value={form.createdAt}
              onChange={handleDateChange}
            />
          </View>
        </View>

        {form.transactionTypeId === TRANSFER_TYPE_ID && (
          <View style={styles.spacing}>
            <Dropdown
              label="Dompet Tujuan"
              value={form.targetWalletId.toString()}
              onSelect={handleTargetWalletChange}
              options={targetWalletOptions}
            />
          </View>
        )}

        <View style={styles.spacing}>
          {isNotification ? (
            <TextInput
              mode="outlined"
              label="Catatan (otomatis)"
              value={form.note ?? ""}
              editable={false}
              multiline
              numberOfLines={3}
              activeOutlineColor={colors.outline}
              outlineColor={colors.outlineVariant}
              style={{backgroundColor: colors.surface}}
              textColor={colors.onSurfaceVariant}
            />
          ) : (
            <>
              <Switch
                label="Tambah Catatan"
                value={isWithNote}
                onValueChange={handleSwitchWithNote}
              />
              {isWithNote ? (
                <TextInput
                  mode="outlined"
                  label="Catatan"
                  value={form.note ?? ""}
                  onChangeText={handleNoteChange}
                  multiline
                  numberOfLines={3}
                  activeOutlineColor={colors.primary}
                />
              ) : null}
            </>
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
