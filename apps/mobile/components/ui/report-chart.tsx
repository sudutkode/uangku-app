import {formatIdr} from "@/utils";
import React, {useEffect, useRef} from "react";
import {Animated, ScrollView, StyleSheet, View} from "react-native";
import {PieChart} from "react-native-gifted-charts";
import {Text, useTheme} from "react-native-paper";

interface ReportItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface Props {
  data: ReportItem[];
}

export default function ReportChart({data}: Props) {
  const {colors} = useTheme();

  const chartScale = useRef(new Animated.Value(0.6)).current;
  const chartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(chartScale, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(chartOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = data.map((item) => ({
    value: item.value,
    color: item.color,
  }));

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Chart Section */}
      <Animated.View
        style={[
          styles.chartWrapper,
          {opacity: chartOpacity, transform: [{scale: chartScale}]},
        ]}
      >
        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={70}
          innerCircleColor={colors.background}
          paddingHorizontal={0}
          showText={false}
        />
      </Animated.View>

      {/* Legend Section */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={styles.leftRow}>
              <View style={[styles.dot, {backgroundColor: item.color}]} />
              <Text variant="bodyLarge">{item.name}</Text>
            </View>

            <View style={styles.rightRow}>
              <Text variant="titleMedium" style={styles.boldText}>
                {item.percentage}%
              </Text>
              <Text variant="bodySmall" style={{color: colors.outline}}>
                {formatIdr(item.value)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  legendContainer: {
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightRow: {
    alignItems: "flex-end",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  boldText: {
    fontWeight: "600",
  },
});
