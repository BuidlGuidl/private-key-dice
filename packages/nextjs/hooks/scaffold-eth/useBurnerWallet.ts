import { Hex } from "viem";

const burnerStorageKey = "burnerWallet.pk";

const isValidSk = (pk: Hex | string | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

export const loadBurnerSK = (): Hex => {
  let currentSk: Hex = "0x";
  if (typeof window != "undefined" && window != null) {
    currentSk = (window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "0x") as Hex;
  }

  if (!!currentSk && isValidSk(currentSk)) {
    return currentSk;
  } else {
    return "0x";
  }
};

export const useBurnerWallet = () => {
  return { loadBurnerSK, isValidSk };
};
