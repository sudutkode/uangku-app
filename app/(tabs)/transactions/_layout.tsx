import {DateStepper} from "@/components/inputs";
import {SummaryCard} from "@/components/ui";
import GmailSyncButton from "@/components/ui/gmail-sync-button";
import {useTransactionsStore} from "@/store";
import {Stack} from "expo-router";
import {useTheme} from "react-native-paper";
import {SafeAreaView} from "react-native-safe-area-context";

export default function TransactionsLayout() {
  const {colors} = useTheme();
  const {selectedDate, setSelectedDate, summary} = useTransactionsStore();

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
      <Stack.Screen
        name="index"
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
              <GmailSyncButton />
            </SafeAreaView>
          ),
        }}
      />
      <Stack.Screen name="add" options={{title: "Add Transaction"}} />
    </Stack>
  );
}
