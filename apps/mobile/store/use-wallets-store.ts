import {Wallet, WalletsResponse} from "@/types";
import {create} from "zustand";

interface WalletState {
  wallets: Wallet[];
  needsRefetch: boolean;

  setWalletsData: (data: WalletsResponse["data"]) => void;
  setNeedsRefetch: (val: boolean) => void;
  reset: () => void;
}

const initialState = {
  wallets: [],
  needsRefetch: false,
};

const useWalletsStore = create<WalletState>((set) => ({
  ...initialState,

  setWalletsData: (data) =>
    set({
      wallets: data,
    }),

  setNeedsRefetch: (val) => set({needsRefetch: val}),

  reset: () => set(initialState),
}));

export default useWalletsStore;
