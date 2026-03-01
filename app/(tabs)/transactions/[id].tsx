import {TransactionForm} from "@/components/forms";
import {Stack, useLocalSearchParams} from "expo-router";
import React from "react";

export default function DetailTransactionScreen() {
  const {id} = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{title: "Transaction"}} />
      <TransactionForm id={id as string} />
    </>
  );
}
