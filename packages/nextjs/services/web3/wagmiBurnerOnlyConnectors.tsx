import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { rainbowkitBurnerWallet } from "burner-connector";

/**
 * wagmi connectors restricted to Burner Wallet only.
 */
export const wagmiBurnerOnlyConnectors = connectorsForWallets(
  [
    {
      groupName: "Burner Wallet",
      wallets: [rainbowkitBurnerWallet],
    },
  ],
  {
    appName: "scaffold-eth-2",
    // A projectId is still required by RainbowKit types even if we don't use WalletConnect.
    projectId: "burner-only",
  },
);


