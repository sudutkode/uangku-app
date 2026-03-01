import {Icon} from "@/components/ui";
import {Wallet} from "@/types";
import {formatIdr, screenWidth} from "@/utils/common-utils";
import {format} from "date-fns";
import {useRouter} from "expo-router";
import type {FC} from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {Divider, List, Text, useTheme} from "react-native-paper";

interface WalletsFlatListProps {
  data: Wallet[];
  loading: boolean;
  refetch: () => void;
}

const WalletsFlatList: FC<WalletsFlatListProps> = ({
  data,
  loading,
  refetch,
}) => {
  const {colors} = useTheme();
  const router = useRouter();

  const renderItem = ({item}: {item: Wallet}) => {
    const handlePress = () => {
      router.push(`/wallets/${item.id}`);
    };

    return (
      <List.Item
        title={item.name}
        titleStyle={styles.title}
        description={`UPDATED ${format(new Date(item.updatedAt), "dd MMM yyyy").toUpperCase()}`}
        descriptionStyle={[styles.description, {color: colors.secondary}]}
        style={styles.item}
        onPress={handlePress}
        right={() => (
          <View style={styles.rightContainer}>
            <Text style={styles.balance}>{formatIdr(item.balance)}</Text>
            <Icon
              name="chevron-right"
              size={14}
              color={colors.outline}
              style={styles.chevron}
            />
          </View>
        )}
      />
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default WalletsFlatList;

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 0,
  },
  balance: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  chevron: {
    marginLeft: 12,
  },
  divider: {
    marginHorizontal: 16,
    height: 0.5,
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: screenWidth * 0.25,
    paddingTop: 8,
  },
});
