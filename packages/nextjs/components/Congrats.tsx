import { Dispatch, SetStateAction } from "react";
import { Hex, createWalletClient } from "viem";
import { http } from "viem";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
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

  const walletClient = createWalletClient({
    chain: configuredNetwork,
    transport: http(),
  });

  const { loadGameState } = useGameData();
  const transferTx = useTransactor(walletClient);
  const { game } = loadGameState();
  const privateKey = "0x" + game?.privateKey;

  const account = privateKeyToAccount(privateKey as Hex);

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
                let value;
                try {
                  value = parseEther("" + game.prize.toString());
                } catch (e) {
                  value = parseEther("" + game.prize.toFixed(8));
                }
                transferTx({
                  account: account,
                  to: game.winner,
                  value,
                  chain: configuredNetwork,
                });
              }}
              className="btn btn-primary"
            >
              Redeem Prize
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congrats;
