import {Tabs} from "expo-router";
import React from "react";
import {useTheme} from "react-native-paper";

import {HapticTab} from "@/components/haptic-tab";
import {Icon} from "@/components/ui";

const tabs = [
  {
    name: "transactions",
    title: "Transaksi",
    icon: "cash-sync",
  },
  {
    name: "wallets",
    title: "Dompet",
    icon: "wallet-bifold-outline",
  },
  {
    name: "report",
    title: "Laporan",
    icon: "chart-arc",
  },
  {
    name: "settings",
    title: "Pengaturan",
    icon: "cog-outline",
  },
];

export default function TabLayout() {
  const {colors} = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surface,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
      }}
      initialRouteName="transactions"
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      {tabs.map(({name, title, icon}) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: title,
            tabBarIcon: ({color}) => <Icon name={icon} color={color} />,
            headerShown: name === "report",
          }}
        />
      ))}
    </Tabs>
  );
}
