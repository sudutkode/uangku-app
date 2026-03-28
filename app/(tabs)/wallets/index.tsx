import React, {useCallback, useEffect} from "react";
import {StyleSheet, View} from "react-native";

import {
  AddButton,
  EmptyState,
  ErrorState,
  LoadingState,
  WalletsList,
} from "@/components/ui";
import {useFetch} from "@/hooks/axios";
import {useWalletsStore} from "@/store";
import {WalletsResponse} from "@/types";

export default function WalletsScreen() {
  const {setWalletsData, wallets, needsRefetch, setNeedsRefetch} =
    useWalletsStore();

  const {
    data: fetchedData,
    loading,
    error,
    refetch,
  } = useFetch<WalletsResponse>("/wallets");

  useEffect(() => {
    if (fetchedData?.data) setWalletsData(fetchedData.data);
  }, [fetchedData, setWalletsData]);

  useEffect(() => {
    if (needsRefetch && fetchedData) {
      refetch();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, refetch, setNeedsRefetch, fetchedData]);

  const renderContent = useCallback(() => {
    if (loading) return <LoadingState message="Memuat dompet..." />;
    if (error) return <ErrorState onRetry={refetch} />;
    if (!wallets.length)
      return (
        <EmptyState
          icon="wallet"
          title="Belum ada dompet"
          subtitle="Dompet anda akan muncul di sini."
          onRefetch={refetch}
        />
      );
    return <WalletsList data={wallets} loading={loading} refetch={refetch} />;
  }, [loading, error, wallets, refetch]);

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
});
