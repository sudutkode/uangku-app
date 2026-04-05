import {formatIdr} from "@/utils";
import React, {memo, useMemo} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Surface, Text, useTheme} from "react-native-paper";

export type ActiveField = "amount" | "adminFee";

interface TransactionDisplayProps {
  amount: number;
  adminFee: number;
  activeField: ActiveField;
  isTransfer: boolean;
  onFieldPress: (field: ActiveField) => void;
}

const TransactionDisplay = memo(
  ({
    amount,
    adminFee,
    activeField,
    isTransfer,
    onFieldPress,
  }: TransactionDisplayProps) => {
    const {colors} = useTheme();

    const amountActive = activeField === "amount";
    const adminFeeActive = activeField === "adminFee";

    const amountBoxStyle = useMemo(
      () => [
        styles.box,
        amountActive && {
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
        },
      ],
      [amountActive, colors.primary],
    );

    const adminFeeBoxStyle = useMemo(
      () => [
        styles.box,
        adminFeeActive && {
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
        },
      ],
      [adminFeeActive, colors.primary],
    );

    return (
      <Surface
        elevation={0}
        // ← Changed from surfaceVariant to surface to match outlined TextInput background
        style={[styles.container, {backgroundColor: colors.surface}]}
      >
        <TouchableOpacity
          onPress={() => onFieldPress("amount")}
          style={amountBoxStyle}
        >
          <Text style={[styles.label, {color: colors.onSurfaceVariant}]}>
            Jumlah
          </Text>
          <Text
            style={[styles.valueLarge, {color: colors.onSurface}]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatIdr(amount)}
          </Text>
        </TouchableOpacity>

        {isTransfer && (
          <>
            <View
              style={[styles.divider, {backgroundColor: colors.outlineVariant}]}
            />
            <TouchableOpacity
              onPress={() => onFieldPress("adminFee")}
              style={adminFeeBoxStyle}
            >
              <Text style={[styles.label, {color: colors.onSurfaceVariant}]}>
                Biaya Admin
              </Text>
              <Text
                style={[styles.valueSmall, {color: colors.onSurface}]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatIdr(adminFee)}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Surface>
    );
  },
);

TransactionDisplay.displayName = "TransactionDisplay";
export default TransactionDisplay;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
  },
  box: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  divider: {
    width: 1,
    marginVertical: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 2,
  },
  valueLarge: {fontSize: 20, fontWeight: "bold"},
  valueSmall: {fontSize: 14, fontWeight: "bold"},
});
