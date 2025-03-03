import { useState } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { Game } from "@prisma/client";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { endGame } from "~~/utils/diceDemo/apiUtils";
import { getApiKey, getBlockExplorerTxLink, notification } from "~~/utils/scaffold-eth";

const TxnNotification = ({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block underline text-md">
          check out transaction
        </a>
      ) : null}
    </div>
  );
};

const useSweepWallet = ({ game, token }: { game?: Game; token?: string }) => {
  const { address } = useAccount();
  const { targetNetwork: configuredNetwork } = useTargetNetwork();
  const apiKey = getApiKey();
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState("");

  const provider = new ethers.providers.AlchemyProvider(configuredNetwork.id, apiKey);

  const sweepWallet = async (privateKey: string) => {
    setIsSweeping(true);
    setSweepMessage("");

    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await wallet.getBalance();

      if (balance.eq(0)) {
        const message = "Wallet has no balance";
        console.log(message);
        setSweepMessage(message);
        notification.info(message);
        await endGame(game as Game, token as string, address as string);
        return;
      }

      // Get current gas price
      const gasPrice = await provider.getGasPrice();

      // Basic ETH transfer requires 21000 gas
      const gasLimit = 21000;

      // Calculate gas cost (gasPrice * gasLimit)
      const gasCost = gasPrice.mul(gasLimit);

      // Check if balance is enough to cover gas
      if (balance.lte(gasCost)) {
        const message = "Balance is not enough to cover gas fees.";
        console.log(message);
        setSweepMessage(message);
        notification.info(message);
        return;
      }

      // Calculate amount to send (leave some buffer for gas price fluctuations)
      // Use 90% of the available balance after gas costs as a buffer
      const availableAfterGas = balance.sub(gasCost);
      const buffer = availableAfterGas.mul(10).div(100); // 10% buffer
      const totalToSend = availableAfterGas.sub(buffer);

      if (totalToSend.lte(0)) {
        const message = "After gas costs and buffer, there's nothing left to send.";
        console.log(message);
        setSweepMessage(message);
        notification.info(message);
        return;
      }

      // Create transaction
      const tx = {
        to: address,
        value: totalToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      };

      // Send transaction
      const notificationId = notification.loading(<TxnNotification message="Sweeping Wallet" />);

      const txResponse = await wallet.sendTransaction(tx);
      const transactionHash = txResponse.hash;

      const blockExplorerTxURL = configuredNetwork ? getBlockExplorerTxLink(configuredNetwork.id, transactionHash) : "";

      await txResponse.wait();
      notification.remove(notificationId);

      notification.success(
        <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
        {
          icon: "🎉",
        },
      );

      setSweepMessage("Wallet swept successfully");
      await endGame(game as Game, token as string, address as string);
      console.log("Transaction sent:", txResponse);
    } catch (error: any) {
      setSweepMessage("Error sweeping wallet: " + error.message);
      console.error("⚡️ ~ Sweep Wallet ~ error", error);
      notification.error(error.message);
    } finally {
      setIsSweeping(false);
    }
  };

  return { sweepWallet, isSweeping, sweepMessage };
};

export default useSweepWallet;
