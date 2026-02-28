import {formatIdr} from "@/utils/common-utils";
import React, {useMemo} from "react";
import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {Surface, useTheme} from "react-native-paper";

export type ActiveField = "amount" | "adminFee";

interface TransactionDisplayProps {
  amount: number;
  adminFee: number;
  activeField: ActiveField;
  isTransfer: boolean;
  onFieldPress: (field: ActiveField) => void;
}

const TransactionDisplay = React.memo(
  ({
    amount,
    adminFee,
    activeField,
    isTransfer,
    onFieldPress,
  }: TransactionDisplayProps) => {
    const theme = useTheme();

    const dividerColor = theme.colors.onPrimaryContainer + "33";

    const amountBoxStyle = useMemo(
      () => [
        styles.box,
        activeField === "amount" && {
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary,
        },
      ],
      [activeField, theme.colors.primary],
    );

    const adminFeeBoxStyle = useMemo(
      () => [
        styles.box,
        styles.rightBox,
        {borderLeftColor: dividerColor},
        activeField === "adminFee" && {
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary,
        },
      ],
      [activeField, theme.colors.primary, dividerColor],
    );

    return (
      <Surface
        elevation={0}
        style={[styles.container, {backgroundColor: theme.colors.surface}]}
      >
        <TouchableOpacity
          onPress={() => onFieldPress("amount")}
          style={amountBoxStyle}
        >
          <Text style={[styles.label, {color: theme.colors.onSurface}]}>
            Amount
          </Text>
          <Text
            style={[styles.valueLarge, {color: theme.colors.onSurface}]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatIdr(amount)}
          </Text>
        </TouchableOpacity>

        {isTransfer && (
          <TouchableOpacity
            onPress={() => onFieldPress("adminFee")}
            style={adminFeeBoxStyle}
          >
            <Text style={[styles.label, {color: theme.colors.onSurface}]}>
              Admin Fee
            </Text>
            <Text
              style={[styles.valueSmall, {color: theme.colors.onSurface}]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatIdr(adminFee)}
            </Text>
          </TouchableOpacity>
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
    marginTop: 8,
  },
  box: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  rightBox: {
    borderLeftWidth: 1,
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
