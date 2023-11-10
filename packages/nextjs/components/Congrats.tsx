import { Dispatch, SetStateAction } from "react";
import { Hex, createWalletClient } from "viem";
import { http } from "viem";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { loadGameState } from "~~/utils/diceDemo/game";

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

  const walletClient = createWalletClient({
    chain: scaffoldConfig.targetNetwork,
    transport: http(),
  });

  const transferTx = useTransactor(walletClient);
  const { game: gameString } = loadGameState();
  const game = JSON.parse(gameString || "{}");
  const privateKey = "0x" + game?.privateKey;

  const account = privateKeyToAccount(privateKey as Hex);

  return (
    <div className="border-2 rounded-xl overflow-hidden border-black w-fit text-xs bg-base-200 h-full">
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
                  chain: scaffoldConfig.targetNetwork,
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
