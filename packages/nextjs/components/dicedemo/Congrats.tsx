import { Dispatch, SetStateAction } from "react";
import { Hex, createWalletClient } from "viem";
import { http } from "viem";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useBalance, useFeeData } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import useGameData from "~~/hooks/useGameData";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const Congrats = ({
  isOpen,
  setIsOpen,
  message,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
}) => {
  const closePopup = () => {
    setIsOpen(false);
  };

  const configuredNetwork = getTargetNetwork();
  const { data } = useFeeData();

  const walletClient = createWalletClient({
    chain: configuredNetwork,
    transport: http(),
  });

  const { loadGameState } = useGameData();
  const transferTx = useTransactor(walletClient);
  const { game } = loadGameState();
  const privateKey = "0x" + game?.privateKey;

  const account = privateKeyToAccount(privateKey as Hex);
  const prize = useBalance({ address: game?.adminAddress });

  return (
    <div className=" overflow-hidden w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-sm text-[0.7rem]">
          <div className="modal-box flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <p className="text-center mt-4">{message}</p>
            <button
              onClick={() => {
                const gasCost = (21000 * Number(data?.formatted.maxFeePerGas)) / 1000000000;
                console.log(gasCost);
                const prizeMinusFee = Number(prize.data?.formatted) - gasCost;
                const value = parseEther(prizeMinusFee.toString());

                transferTx({
                  account: account,
                  to: game.winner,
                  value,
                  chain: configuredNetwork,
                  gas: BigInt("21000"),
                });
              }}
              className="btn btn-primary"
            >
              Sweep Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congrats;
