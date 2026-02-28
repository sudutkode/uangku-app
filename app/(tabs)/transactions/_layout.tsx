import {Stack} from "expo-router";
import {useTheme} from "react-native-paper";

export default function TransactionsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        // This ensures the title from the file is used
        // headerTitleAlign: "center",
      }}
    >
      {/* The main list */}
      <Stack.Screen name="index" options={{title: "Transactions"}} />
      {/* The add screen (will automatically get a back button) */}
      <Stack.Screen
        name="add"
        options={{title: "Add Transaction", headerBackTitle: "Back"}}
      />
    </Stack>
  );
}
