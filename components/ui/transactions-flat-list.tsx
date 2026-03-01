import {Transaction} from "@/types";
import {formatIdr, getOperatorSymbol, screenWidth} from "@/utils/common-utils";
import {useRouter} from "expo-router";
import type {FC} from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {Divider, List, Text, useTheme} from "react-native-paper";
import Icon from "./icon-fa6";
import TransactionBadge from "./transaction-badge";

interface TransactionsFlatListProps {
  data: Transaction[];
  loading: boolean;
  refetch: () => void;
}

const TransactionsFlatList: FC<TransactionsFlatListProps> = ({
  data,
  loading,
  refetch,
}) => {
  const {colors} = useTheme();
  const router = useRouter();

  const renderItem = ({item}: {item: Transaction}) => {
    const typeId = item.transactionType.id;

    const getTypeColor = () => {
      if (typeId === 1) return colors.primary;
      if (typeId === 2) return colors.error;
      return colors.tertiary;
    };

    const typeColor = getTypeColor();

    const handlePress = () => {
      router.push(`/transactions/${item.id}`);
    };
    return (
      <List.Item
        title={item.transactionCategory.name}
        titleStyle={styles.title}
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
            <Text style={styles.amount}>
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
        onPress={handlePress}
      />
    );
  };

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

export default TransactionsFlatList;

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
