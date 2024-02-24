import { useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Game } from "~~/types/game/game";
import { endGame } from "~~/utils/diceDemo/apiUtils";
import { getApiKey, getBlockExplorerTxLink, getTargetNetwork } from "~~/utils/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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
  const configuredNetwork = getTargetNetwork();
  const apiKey = getApiKey();
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState("");

  const provider = new ethers.providers.AlchemyProvider(configuredNetwork.network, apiKey);

  const sweepWallet = async (privateKey: string) => {
    setIsSweeping(true);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await wallet.getBalance();
    if (balance.eq(0)) {
      const message = "Wallet has no balance";
      console.log(message);
      setIsSweeping(false);
      setSweepMessage(message);
      notification.info(message);
      return;
    }

    const gasPrice = await provider.getGasPrice();

    const gasLimit = 21000000;
    const gasCost = gasPrice.mul(35000000); // gasLimit * 1.667

    // const totalToSend = balance.sub(gasCost.mul(2));
    const totalToSend = balance.sub(gasCost);

    console.log(totalToSend.toNumber());
    console.log(gasCost.toNumber());

    if (totalToSend.lte(0)) {
      const message = "Balance is not enough to cover gas fees.";
      console.log(message);
      setIsSweeping(false);
      setSweepMessage(message);
      notification.info(message);
      return;
    }

    const tx = {
      to: address,
      value: totalToSend,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    let txReceipt = null;

    let notificationId = null;
    try {
      txReceipt = await wallet.sendTransaction(tx);
      const transactionHash = txReceipt.hash;

      notificationId = notification.loading(<TxnNotification message="Sweeping Wallet" />);

      const blockExplorerTxURL = configuredNetwork ? getBlockExplorerTxLink(configuredNetwork.id, transactionHash) : "";
      await txReceipt.wait();
      notification.remove(notificationId);

      notification.success(
        <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
        {
          icon: "🎉",
        },
      );

      endGame(game as Game, token as string, address as string);
      setIsSweeping(false);
    } catch (error: any) {
      setIsSweeping(false);
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("⚡️ ~ Sweep Wallet ~ error", error);
      notification.error(error.message);
    }

    console.log("Transaction sent:", txReceipt);
  };

  return { sweepWallet, isSweeping, sweepMessage };
};

export default useSweepWallet;
