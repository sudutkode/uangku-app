import { Tabs } from "expo-router";
import React from "react";
import { useTheme } from "react-native-paper";

import { HapticTab } from "@/components/haptic-tab";
import { Icon } from "@/components/ui";

const tabs = [
  { name: "index", title: "Transactions", icon: "money-bill-transfer" },
  { name: "wallets", title: "Wallets", icon: "wallet" },
  { name: "report", title: "Report", icon: "chart-pie" },
  { name: "profile", title: "Profile", icon: "user" },
];

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
           backgroundColor: theme.colors.surface,
        }
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: title,
            tabBarIcon: ({ color }) => (
              <Icon size={20} name={icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}