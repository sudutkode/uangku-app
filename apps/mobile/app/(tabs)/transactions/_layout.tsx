import {Stack} from "expo-router";
import {useTheme} from "react-native-paper";

export default function TransactionsLayout() {
  const {colors} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" options={{title: "Add Transaction"}} />
    </Stack>
  );
}
