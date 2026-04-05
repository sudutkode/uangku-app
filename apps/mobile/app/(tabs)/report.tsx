import {Stack} from "expo-router";
import React, {useCallback, useMemo, useState} from "react";
import {StyleSheet, View} from "react-native";
import {SegmentedButtons, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

import {DateStepper} from "@/components/inputs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ReportChart,
  SummaryCard,
} from "@/components/ui";
import {useFetch} from "@/hooks/axios";
import {MonthlyReportResponse} from "@/types/api-response-types";
import {getCategoryColor} from "@/utils";

type ReportTab = "expense" | "income";

export default function ReportScreen() {
  const {colors} = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ReportTab>("expense");

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const {data, loading, error, refetch} = useFetch<MonthlyReportResponse>(
    "/reports/monthly",
    {params: {year, month}},
  );

  const chartData = useMemo(() => {
    const breakdown = data?.breakdown;
    if (!breakdown) return [];

    const current = breakdown[activeTab];
    if (!current?.categories) return [];

    const mapped = current.categories.map((item, index) => ({
      name: item.categoryName,
      value: item.total,
      percentage: item.percentage,
      color: getCategoryColor(index),
    }));

    if (activeTab === "expense" && breakdown.expense.adminFee.total) {
      mapped.push({
        name: "Admin Fee",
        value: breakdown.expense.adminFee.total,
        percentage: breakdown.expense.adminFee.percentage,
        color: "hsl(0, 0%, 60%)",
      });
    }

    return mapped;
  }, [data?.breakdown, activeTab]);

  const renderContent = useCallback(() => {
    if (loading) return <LoadingState message="Memuat laporan..." />;
    if (error)
      return <ErrorState message="Failed to load report" onRetry={refetch} />;
    if (!chartData.length)
      return (
        <EmptyState
          title="Belum ada data laporan"
          subtitle="Data laporan anda akan muncul di sini."
          onRefetch={refetch}
        />
      );
    return <ReportChart data={chartData} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, chartData]);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <SafeAreaView
              edges={["top"]}
              style={{backgroundColor: colors.surface}}
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
      <SegmentedButtons
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ReportTab)}
        buttons={[
          {value: "expense", label: "Pengeluaran"},
          {value: "income", label: "Pemasukan"},
        ]}
        style={styles.segmented}
      />
      <View style={styles.container}>{renderContent()}</View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmented: {
    margin: 16,
  },
});
