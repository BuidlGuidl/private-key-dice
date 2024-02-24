import { Dispatch, SetStateAction } from "react";
import { Game } from "~~/types/game/game";

const Congrats = ({
  isOpen,
  setIsOpen,
  isHacked,
  isWinner,
  game,
  isSweeping,
  sweepMessage,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isHacked: boolean;
  isWinner: boolean;
  game: Game;
  isSweeping: boolean;
  sweepMessage: string;
}) => {
  const closePopup = () => {
    setIsOpen(false);
  };

  // const { isSweeping } = useSweepWallet({ game: game, token: token });

  return (
    <div className=" overflow-hidden w-fit text-lg bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-20">
          <div className="modal-box md:h-[30%] flex flex-col items-center py-4 pt-6">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>

            {isWinner && (
              <p className="text-center">
                Congrats, you found the hidden characters and have successfully swept the private Key
              </p>
            )}
            {!isWinner && isHacked && !game.winner && (
              <p className="text-center">
                Hidden characters found, {isSweeping ? "Trying to sweep private key ..." : sweepMessage}
              </p>
            )}
            {!isWinner && isHacked && game.winner != undefined && (
              <p className="text-center">
                Hidden characters found but you were beaten to sweeping the private key by another wallet
              </p>
            )}
            {!isWinner && !isHacked && <div>Sorry fren, you lost</div>}

            <p className="text-center mt-5 text-2xl">
              The hidden characters are {Object.values(game.hiddenChars).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congrats;
