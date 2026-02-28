import {Icon} from "@/components/ui";
import {useFetch} from "@/hooks/axios/use-fetch";
import {TransactionCategoriesResponse} from "@/types";
import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {
  ActivityIndicator,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";

interface TransactionCategoryPickerProps {
  transactionTypeId: number;
  transactionCategoryId: number;
  onTypeChange: (typeId: number) => void;
  onCategoryChange: (catId: number) => void;
}

const TransactionCategoryPicker = ({
  transactionTypeId,
  transactionCategoryId,
  onTypeChange,
  onCategoryChange,
}: TransactionCategoryPickerProps) => {
  const {colors} = useTheme();

  const {data, loading, error} = useFetch<TransactionCategoriesResponse>(
    "transaction-categories",
  );
  const categories = data?.data?.data || [];

  const filteredTransactionCategoryPicker = categories.filter(
    (c) => c.transactionType.id === transactionTypeId,
  );

  return (
    <View>
      <SegmentedButtons
        value={String(transactionTypeId)}
        onValueChange={(val) => onTypeChange(Number(val))}
        buttons={[
          {value: "1", label: "Income", icon: "plus"},
          {value: "2", label: "Expense", icon: "minus"},
          {value: "3", label: "Transfer", icon: "swap-horizontal"},
        ]}
      />

      {/* Handle Loading & Error States */}
      {loading ? (
        <View style={style.stateContainer}>
          <ActivityIndicator
            animating={true}
            color={colors.primary}
            size="large"
          />
        </View>
      ) : error ? (
        <View style={style.stateContainer}>
          <Text style={{color: colors.error}}>Failed to load categories.</Text>
        </View>
      ) : (
        <View style={style.grid}>
          {filteredTransactionCategoryPicker.map((cat) => {
            const isSelected = transactionCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => onCategoryChange(cat.id)}
                style={style.categoryItem}
              >
                <View
                  style={[
                    style.iconCircle,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                >
                  <Icon
                    name={cat.iconName || ""}
                    size={20}
                    color={isSelected ? "white" : colors.onSurface}
                  />
                </View>
                <Text variant="labelSmall" style={style.catLabel}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};
export default TransactionCategoryPicker;

const style = StyleSheet.create({
  stateContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    justifyContent: "flex-start",
  },
  categoryItem: {width: "25%", alignItems: "center", marginBottom: 16},
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  catLabel: {textAlign: "center"},
});
