import {useWalletsStore} from "@/store";
import {Wallet} from "@/types";
import {formatIdr} from "@/utils";
import {Stack} from "expo-router";
import {View} from "react-native";
import {Text, useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function WalletsLayout() {
  const {colors} = useTheme();
  const {wallets} = useWalletsStore();
  const totalBalance =
    wallets?.reduce((acc: number, curr: Wallet) => acc + curr.balance, 0) || 0;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerTitle: "Wallet",
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <SafeAreaView
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                paddingBottom: 0,
                elevation: 4,
                borderBottomColor: colors.outlineVariant,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text variant="labelLarge">Total Saldo</Text>
                <Text variant="titleSmall">{formatIdr(totalBalance)}</Text>
              </View>
            </SafeAreaView>
          ),
        }}
      />
      <Stack.Screen name="add" options={{title: "Add Wallet"}} />
    </Stack>
  );
}
