import React, {memo, useCallback} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, IconButton, Text, useTheme} from "react-native-paper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeypadButtonProps {
  value: string;
  onPress: (value: string) => void;
}

interface TransactionKeypadProps {
  onKeyPress: (value: string) => void;
  onSave: () => void;
  saveDisabled: boolean;
  loading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "backspace"],
];

// ─── KeypadButton ─────────────────────────────────────────────────────────────

const KeypadButton = memo(({value, onPress}: KeypadButtonProps) => {
  const {colors} = useTheme();
  const isBackspace = value === "backspace";

  const handlePress = useCallback(() => onPress(value), [value, onPress]);

  return (
    <TouchableOpacity
      style={styles.keypadBtn}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {isBackspace ? (
        <IconButton
          icon="backspace-outline"
          size={24}
          iconColor={colors.primary}
        />
      ) : (
        <Text style={[styles.keypadText, {color: colors.onSurface}]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
});
KeypadButton.displayName = "KeypadButton";

// ─── TransactionKeypad ────────────────────────────────────────────────────────

const TransactionKeypad = memo(
  ({onKeyPress, onSave, saveDisabled, loading}: TransactionKeypadProps) => (
    <View style={styles.wrapper}>
      {/* BUG FIX: was using row index as key — now uses row content as key */}
      {KEYPAD_ROWS.map((row) => (
        <View key={row.join("")} style={styles.row}>
          {row.map((key) => (
            <KeypadButton key={key} value={key} onPress={onKeyPress} />
          ))}
        </View>
      ))}

      <View style={styles.actionRow}>
        <Button
          mode="contained"
          contentStyle={styles.saveContent}
          style={styles.saveBtn}
          disabled={saveDisabled || loading}
          onPress={onSave}
          loading={loading}
        >
          Simpan
        </Button>
      </View>
    </View>
  ),
);
TransactionKeypad.displayName = "TransactionKeypad";

export default TransactionKeypad;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(0,0,0,0.02)",
    paddingTop: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  keypadBtn: {
    flex: 1,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  keypadText: {
    fontSize: 22,
    fontWeight: "500",
  },
  actionRow: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  saveContent: {
    height: 48,
  },
  saveBtn: {
    borderRadius: 12,
  },
});
