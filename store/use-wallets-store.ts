import {Wallet, WalletsResponse} from "@/types";
import {create} from "zustand";

interface WalletState {
  wallets: Wallet[];
  setWalletsData: (data: WalletsResponse["data"]) => void;
  needsRefetch: boolean;
  setNeedsRefetch: (val: boolean) => void;
}

const useWalletsStore = create<WalletState>((set) => ({
  wallets: [],
  setWalletsData: (data) =>
    set({
      wallets: data,
    }),
  needsRefetch: false,
  setNeedsRefetch: (val) => set({needsRefetch: val}),
}));

export default useWalletsStore;
