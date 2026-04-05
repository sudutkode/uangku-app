import {WalletForm} from "@/components/forms";
import {Stack, useLocalSearchParams} from "expo-router";
import React from "react";

export default function DetailWalletScreen() {
  const {id} = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{title: "Wallet"}} />
      <WalletForm id={id as string} />
    </>
  );
}
