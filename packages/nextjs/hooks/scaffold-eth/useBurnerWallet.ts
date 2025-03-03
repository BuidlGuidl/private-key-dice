import { Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";

const burnerStorageKey = "burnerWallet.pk";

const isValidSk = (pk: Hex | string | undefined | null): boolean => {
  return typeof pk === "string" && (pk.length === 64 || pk.length === 66);
};

export const loadBurnerSK = (): Hex => {
  // Only run in browser environment
  if (typeof window === "undefined") return "0x" as Hex;

  // Try to get existing key
  let currentSk: string = window.localStorage.getItem(burnerStorageKey)?.replaceAll('"', "") || "";

  // Ensure it has 0x prefix
  if (currentSk && !currentSk.startsWith("0x")) {
    currentSk = "0x" + currentSk;
  }

  // If valid, return it
  if (isValidSk(currentSk)) {
    return currentSk as Hex;
  }

  // Otherwise return 0x to indicate generation needed
  return "0x" as Hex;
};

export const generateAndSaveBurnerSK = (): Hex => {
  // Only run in browser environment
  if (typeof window === "undefined") return "0x" as Hex;

  // Generate new private key
  const newSk = generatePrivateKey();

  // Save it
  window.localStorage.setItem(burnerStorageKey, newSk);

  return newSk as Hex;
};

export const useBurnerWallet = () => {
  return { loadBurnerSK, generateAndSaveBurnerSK, isValidSk };
};
