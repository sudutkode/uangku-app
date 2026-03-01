import {DateStepper} from "@/components/inputs";
import {SummaryCard} from "@/components/ui";
import {useTransactionsStore} from "@/store";
import {Stack} from "expo-router";
import {View} from "react-native";
import {useTheme} from "react-native-paper";

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
            <View style={{backgroundColor: colors.surface, paddingTop: 50}}>
              <DateStepper date={selectedDate} onChange={setSelectedDate} />
              <SummaryCard data={summary} />
            </View>
          ),
        }}
      />
      <Stack.Screen name="add" options={{title: "Add Transaction"}} />
    </Stack>
  );
}
