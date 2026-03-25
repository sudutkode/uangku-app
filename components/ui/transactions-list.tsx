import {Transaction} from "@/types";
import {formatIdr, getOperatorSymbol, screenWidth} from "@/utils/common-utils";
import {useRouter} from "expo-router";
import type {FC} from "react";
import {useCallback} from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {Divider, List, Text, useTheme} from "react-native-paper";
import Icon from "./icon-fa6";
import TransactionBadge from "./transaction-badge";

interface TransactionsListProps {
  data: Transaction[];
  loading: boolean;
  refetch: () => void;
}

const TransactionsList: FC<TransactionsListProps> = ({
  data,
  loading,
  refetch,
}) => {
  const {colors} = useTheme();
  const router = useRouter();

  const renderItem = useCallback(
    ({item}: {item: Transaction}) => {
      const typeId = item.transactionType.id;

      const typeColor =
        typeId === 1
          ? colors.primary
          : typeId === 2
            ? colors.error
            : colors.tertiary;

      // Show note truncated if present, else fall back to category name.
      // numberOfLines={1} on List.Item title handles the ellipsis natively.
      const title = item.note?.trim() || item.transactionCategory.name;

      return (
        <List.Item
          title={title}
          titleNumberOfLines={1}
          titleEllipsizeMode="tail"
          titleStyle={styles.title}
          description={item.transactionCategory.name}
          descriptionStyle={styles.description}
          contentStyle={styles.content}
          style={styles.item}
          left={() => (
            <View style={styles.leftContainer}>
              <View style={[styles.iconWrapper, {backgroundColor: typeColor}]}>
                <Icon
                  name={item.transactionCategory.iconName || ""}
                  size={18}
                  color={colors.surface}
                />
              </View>
            </View>
          )}
          right={() => (
            <View style={styles.rightContainer}>
              <Text style={[styles.amount, {color: typeColor}]}>
                {getOperatorSymbol(typeId)}
                {formatIdr(item.amount)}
              </Text>

              {item.adminFee > 0 && (
                <Text style={styles.fee}>{formatIdr(item.adminFee)} fee</Text>
              )}

              <View style={styles.badgeContainer}>
                {item.transactionWallets.map((tw: any) => (
                  <TransactionBadge key={tw.id} isIncome={tw.isIncoming}>
                    {tw.wallet.name}
                  </TransactionBadge>
                ))}
              </View>
            </View>
          )}
          onPress={() => router.push(`/transactions/${item.id}`)}
        />
      );
    },
    [colors, router],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <Divider />}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

export default TransactionsList;

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  content: {
    paddingVertical: 8,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    alignSelf: "flex-start",
  },
  description: {
    fontSize: 11,
    alignSelf: "flex-start",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  leftContainer: {
    justifyContent: "center",
  },
  amount: {
    fontSize: 14,
    fontWeight: 700,
  },
  fee: {
    fontSize: 11,
    opacity: 0.6,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
  },
  listContent: {
    paddingBottom: screenWidth * 0.25,
  },
});
