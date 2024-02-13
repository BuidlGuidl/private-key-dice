import { ethers } from "ethers";
import { useAccount } from "wagmi";
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

const useSweepWallet = () => {
  const { address } = useAccount();
  const configuredNetwork = getTargetNetwork();
  const apiKey = getApiKey();

  const provider = new ethers.providers.AlchemyProvider(configuredNetwork.network, apiKey);

  const sweepWallet = async (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await wallet.getBalance();
    if (balance.eq(0)) {
      console.log("Wallet balance is 0");
      notification.info("Wallet balance is 0");
      return;
    }

    const gasPrice = await provider.getGasPrice();

    const gasLimit = 21000;
    const gasCost = gasPrice.mul(gasLimit);

    // const totalToSend = balance.sub(gasCost.mul(2));
    let totalToSend = balance.sub(gasCost);

    const overshotPercentage = 2;
    const overshotAmount = totalToSend.mul(overshotPercentage).div(100);
    totalToSend = totalToSend.sub(overshotAmount);

    if (totalToSend.lte(0)) {
      console.log("Balance is not enough to cover gas fees.");
      notification.info("Balance is not enough to cover gas fees.");
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
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("⚡️ ~ Sweep Wallet ~ error", error);
      notification.error(error.message);
    }

    console.log("Transaction sent:", txReceipt);
  };

  return { sweepWallet };
};

export default useSweepWallet;
