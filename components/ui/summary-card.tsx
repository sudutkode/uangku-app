import {TransactionSummary} from "@/types";
import {formatIdr} from "@/utils/common-utils";
import {StyleSheet, View} from "react-native";
import {Surface, Text, useTheme} from "react-native-paper";

interface SummaryCardProps {
  data?: TransactionSummary;
}

const SummaryCard = ({data}: SummaryCardProps) => {
  const {colors} = useTheme();
  return (
    <Surface
      style={[styles.wrapper, {backgroundColor: colors.surface}]}
      mode="flat"
    >
      <View style={styles.summaryItem}>
        <Text variant="labelSmall">Income</Text>
        <Text variant="bodySmall" style={styles.body}>
          + {formatIdr(data?.income || 0)}
        </Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryItem}>
        <Text variant="labelSmall">Expenses</Text>
        <Text variant="bodySmall" style={styles.body}>
          - {formatIdr(data?.expense || 0)}
        </Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryItem}>
        <Text variant="labelSmall">Balance</Text>
        <Text variant="bodySmall" style={styles.body}>
          {data?.balance && data.balance >= 0 ? "+" : "-"}{" "}
          {formatIdr(Math.abs(data?.balance || 0))}
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    justifyContent: "space-between",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  body: {fontWeight: "700"},
});

export default SummaryCard;
