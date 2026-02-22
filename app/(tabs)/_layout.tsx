import {Tabs} from "expo-router";
import React from "react";

import {HapticTab} from "@/components/haptic-tab";
// import { IconSymbol } from '@/components/ui/icon-symbol';
import {Icon} from "@/components/ui";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";

const tabs = [
  {name: "index", title: "Transactions", icon: "money-bill-transfer"},
  {name: "wallets", title: "Wallets", icon: "wallet"},
  {name: "report", title: "Report", icon: "chart-pie"},
  {name: "profile", title: "Profile", icon: "user"},
];

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // const isLoggedIn = false;

  // if (!isLoggedIn) {
  //   return <Redirect href="../(auth)/login" />;
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
      {tabs.map(({name, title, icon}) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: title,
            tabBarIcon: ({color}) => (
              <Icon size={20} name={icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
