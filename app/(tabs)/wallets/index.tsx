import React, {useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {ActivityIndicator, Button, Text, useTheme} from "react-native-paper";

import {AddButton, Icon, WalletsFlatList} from "@/components/ui";
import {useFetch} from "@/hooks/axios/use-fetch";
import {useWalletsStore} from "@/store";
import {WalletsResponse} from "@/types";

export default function WalletsScreen() {
  const {colors} = useTheme();

  const {setWalletsData, wallets, needsRefetch, setNeedsRefetch} =
    useWalletsStore();

  const {
    data: fetchedData,
    loading,
    error,
    refetch,
  } = useFetch<WalletsResponse>("/wallets");

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{marginTop: 12}}>Loading wallets...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="triangle-exclamation" size={32} color={colors.error} />
          <Text style={{marginTop: 12, marginBottom: 8}}>
            Something went wrong
          </Text>
          <Button mode="contained" onPress={refetch}>
            Retry
          </Button>
        </View>
      );
    }

    if (!wallets.length) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="receipt" size={32} color={colors.secondary} />
          <Text style={{marginTop: 12}}>No wallets yet</Text>
          <Text style={{fontSize: 12, color: colors.secondary}}>
            Your wallets will appear here
          </Text>
        </View>
      );
    }

    return (
      <WalletsFlatList data={wallets} loading={loading} refetch={refetch} />
    );
  };

  useEffect(() => {
    if (fetchedData?.data) {
      setWalletsData(fetchedData.data);
    }
  }, [fetchedData, setWalletsData]);

  useEffect(() => {
    if (needsRefetch) {
      refetch();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, refetch, setNeedsRefetch]);

  return (
    <View style={styles.container}>
      {renderContent()}
      <AddButton screenName="wallets" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
});
