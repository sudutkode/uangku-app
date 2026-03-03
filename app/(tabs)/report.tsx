import {Stack} from "expo-router";
import React, {useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {
  ActivityIndicator,
  Button,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";

import {DateStepper} from "@/components/inputs";
import {Icon, ReportChart, SummaryCard} from "@/components/ui";
import {useFetch} from "@/hooks/axios/use-fetch";
import {MonthlyReportResponse} from "@/types/api-response-types";
import {getCategoryColor} from "@/utils/common-utils";
import {SafeAreaView} from "react-native-safe-area-context";

type ReportTab = "expense" | "income";

export default function ReportScreen() {
  const {colors} = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ReportTab>("expense");

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const {data, loading, error, refetch} = useFetch<MonthlyReportResponse>(
    "/reports/monthly",
    {
      params: {year, month},
    },
  );

  const chartData = useMemo(() => {
    const breakdown = data?.breakdown;
    if (!breakdown) return [];

    const currentBreakdown = breakdown[activeTab];

    if (!currentBreakdown?.categories) return [];

    const mapped = currentBreakdown.categories.map((item, index) => ({
      name: item.categoryName,
      value: item.total,
      percentage: item.percentage,
      color: getCategoryColor(index),
    }));

    if (activeTab === "expense" && breakdown.expense.adminFee) {
      mapped.push({
        name: "Admin Fee",
        value: breakdown.expense.adminFee.total,
        percentage: breakdown.expense.adminFee.percentage,
        color: "hsl(0, 0%, 60%)",
      });
    }

    return mapped;
  }, [data?.breakdown, activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{marginTop: 12}}>Loading report...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="triangle-exclamation" size={32} color={colors.error} />
          <Text style={{marginTop: 12, marginBottom: 8}}>
            Failed to load report
          </Text>
          <Button mode="contained" onPress={refetch}>
            Retry
          </Button>
        </View>
      );
    }

    if (!chartData.length) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="chart-pie" size={32} color={colors.secondary} />
          <Text style={{marginTop: 12}}>No report data</Text>
          <Text style={{fontSize: 12, color: colors.secondary}}>
            Your report will appear here
          </Text>
        </View>
      );
    }

    return (
      <>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ReportTab)}
          buttons={[
            {value: "expense", label: "Expense"},
            {value: "income", label: "Income"},
          ]}
          style={{margin: 16}}
        />

        {/* RENDER CHART COMPONENT HERE */}
        <ReportChart data={chartData} />
      </>
    );
  };

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
              <DateStepper
                date={selectedDate}
                onChange={setSelectedDate}
                mode="month"
              />
              {data?.summary && <SummaryCard data={data.summary} />}
            </SafeAreaView>
          ),
        }}
      />

      <View style={styles.container}>{renderContent()}</View>
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
