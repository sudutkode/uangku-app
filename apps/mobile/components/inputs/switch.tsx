import type {FC} from "react";
import {StyleSheet, View} from "react-native";
import {
  Switch as PaperSwitch,
  Text,
  useTheme,
  type SwitchProps as PaperSwitchProps,
} from "react-native-paper";

interface SwitchProps extends PaperSwitchProps {
  label: string;
}

const Switch: FC<SwitchProps> = ({label, ...props}) => {
  const {colors} = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="labelLarge">{label}</Text>
      <PaperSwitch {...props} color={colors.primary} />
    </View>
  );
};

export default Switch;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
