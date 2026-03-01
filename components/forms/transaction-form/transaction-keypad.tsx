import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, IconButton, Text, useTheme} from "react-native-paper";

interface KeypadButtonProps {
  value: string;
  onPress: (value: string) => void;
}

const KeypadButton = React.memo(({value, onPress}: KeypadButtonProps) => {
  const {colors} = useTheme();
  const isBackspace = value === "backspace";

  return (
    <TouchableOpacity
      style={keypadButtonStyles.keypadBtn}
      onPress={() => onPress(value)}
      activeOpacity={0.6}
    >
      {isBackspace ? (
        <IconButton
          icon="backspace-outline"
          size={24}
          iconColor={colors.primary}
        />
      ) : (
        <Text
          style={[keypadButtonStyles.keypadText, {color: colors.onSurface}]}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
});

KeypadButton.displayName = "KeypadButton";

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "backspace"],
];

interface TransactionKeypadProps {
  onKeyPress: (value: string) => void;
  onSave: () => void;
  saveDisabled: boolean;
  isEdit: boolean;
  loading: boolean;
}

const TransactionKeypad = React.memo(
  ({
    onKeyPress,
    onSave,
    saveDisabled,
    isEdit,
    loading,
  }: TransactionKeypadProps) => (
    <View style={styles.keypadWrapper}>
      {KEYPAD_ROWS.map((row, i) => (
        <View key={i} style={styles.keypadRow}>
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
          {isEdit ? "Update" : "Save"}
        </Button>
      </View>
    </View>
  ),
);

TransactionKeypad.displayName = "TransactionKeypad";

export default TransactionKeypad;

const styles = StyleSheet.create({
  keypadWrapper: {
    backgroundColor: "rgba(0,0,0,0.02)",
    paddingTop: 10,
    paddingBottom: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  actionRow: {paddingHorizontal: 20, marginTop: 10},
  saveContent: {height: 48},
  saveBtn: {borderRadius: 12},
});

const keypadButtonStyles = StyleSheet.create({
  keypadBtn: {
    flex: 1,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  keypadText: {fontSize: 22, fontWeight: "500"},
});
