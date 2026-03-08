import React, {useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {ActivityIndicator, Button, Text, useTheme} from "react-native-paper";

import {DateStepper} from "@/components/inputs";
import {
  AddButton,
  Icon,
  SummaryCard,
  TransactionsFlatList,
} from "@/components/ui";
import GmailSyncButton from "@/components/ui/gmail-sync-button";
import {useFetch} from "@/hooks/axios/use-fetch";
import {useTransactionsStore} from "@/store";
import {TransactionsResponse} from "@/types";
import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

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
    params: {
      date: selectedDate.toLocaleDateString("sv-SE"),
    },
  });

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{marginTop: 12}}>Loading transactions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="triangle-exclamation" size={32} color={colors.error} />
          <Text style={{marginTop: 12, marginBottom: 8}}>{error}</Text>
          <Button mode="contained" onPress={refetch}>
            Retry
          </Button>
        </View>
      );
    }

    if (!transactions.length) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="receipt" size={32} color={colors.secondary} />
          <Text style={{marginTop: 12}}>No transactions yet</Text>
          <Text style={{fontSize: 12, color: colors.secondary}}>
            Your transactions will appear here
          </Text>
        </View>
      );
    }

    return (
      <TransactionsFlatList
        data={transactions}
        loading={loading}
        refetch={refetch}
      />
    );
  };

  useEffect(() => {
    if (fetchedData?.data) {
      setTransactionsData(fetchedData.data);
    }
  }, [fetchedData, setTransactionsData]);

  useEffect(() => {
    if (needsRefetch) {
      refetch();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, refetch, setNeedsRefetch]);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView
              edges={["top"]}
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <DateStepper date={selectedDate} onChange={setSelectedDate} />
              <SummaryCard data={summary} />
              <GmailSyncButton callback={refetch} />
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

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
});
