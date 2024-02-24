import { Dispatch, SetStateAction } from "react";
import { Game } from "~~/types/game/game";

const Congrats = ({
  isOpen,
  setIsOpen,
  isHacked,
  isWinner,
  game,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isHacked: boolean;
  isWinner: boolean;
  game: Game;
}) => {
  const closePopup = () => {
    setIsOpen(false);
  };

  // const { isSweeping } = useSweepWallet({ game: game, token: token });

  return (
    <div className=" overflow-hidden w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-sm text-[0.7rem]">
          <div className="modal-box flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>

            {isWinner && (
              <div>Congrats, you found the hidden characters and have successfully swept the private Key</div>
            )}
            {!isWinner && isHacked && !game.winner && (
              <div>Hidden characters found, Trying to sweep private key ...</div>
            )}
            {!isWinner && isHacked && game.winner != undefined && (
              <div>Hidden characters found but you were beaten to sweeping the private key by another wallet</div>
            )}
            {!isWinner && !isHacked && <div>Sorry fren, you lost</div>}

            <div className="mt-5">The hidden characters are {Object.values(game.hiddenChars).join(", ")}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congrats;
