import {Stack} from "expo-router";
import React, {useCallback, useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

import {DateStepper} from "@/components/inputs";
import {
  AddButton,
  EmptyState,
  ErrorState,
  LoadingState,
  SummaryCard,
  TransactionsList,
} from "@/components/ui";
import {useFetch} from "@/hooks/axios";
import {useTransactionsStore} from "@/store";
import {TransactionsResponse} from "@/types";

export default function TransactionScreen() {
  const {colors} = useTheme();

  const {
    selectedDate,
    setTransactionsData,
    transactions,
    needsRefetch,
    setNeedsRefetch,
    summary,
    setSelectedDate,
  } = useTransactionsStore();

  const {
    data: fetchedData,
    loading,
    error,
    refetch,
  } = useFetch<TransactionsResponse>("/transactions", {
    params: {date: selectedDate.toLocaleDateString("sv-SE")},
  });

  useEffect(() => {
    if (fetchedData?.data) setTransactionsData(fetchedData.data);
  }, [fetchedData, setTransactionsData]);

  useEffect(() => {
    if (needsRefetch && fetchedData) {
      refetch();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, refetch, setNeedsRefetch, fetchedData]);

  const renderContent = useCallback(() => {
    if (loading) return <LoadingState message="Memuat transaksi..." />;
    if (error) return <ErrorState message={error} onRetry={refetch} />;
    if (!transactions.length)
      return (
        <EmptyState
          icon="receipt"
          title="Belum ada transaksi"
          subtitle="Transaksi anda akan muncul di sini."
          onRefetch={refetch}
        />
      );
    return (
      <TransactionsList
        data={transactions}
        loading={loading}
        refetch={refetch}
      />
    );
  }, [loading, error, transactions, refetch]);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView
              edges={["top"]}
              style={{backgroundColor: colors.surface, paddingBottom: 8}}
            >
              <DateStepper date={selectedDate} onChange={setSelectedDate} />
              <SummaryCard data={summary} />
            </SafeAreaView>
          ),
        }}
      />
      <View style={styles.container}>
        {renderContent()}
        <AddButton screenName="transactions" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
