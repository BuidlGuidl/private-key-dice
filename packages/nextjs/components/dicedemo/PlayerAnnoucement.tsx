import { Dispatch, SetStateAction } from "react";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import { Game } from "~~/types/game/game";

const PlayerAnnouncement = ({
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

  const privateKey = loadBurnerSK();
  const pwlink = "https://punkwallet.io/opt:pk#" + privateKey;

  return (
    <div className=" overflow-hidden w-fit text-lg bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-20">
          <div className="modal-box md:h-[30%] flex flex-col items-center py-4 pt-6">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>

            {isWinner && (
              <div>
                <p className="text-center">
                  Congrats, you found the hidden characters and have successfully swept the private Key
                </p>
                <p className="text-center">
                  <a className="font-bold italic text-xl" href={pwlink} target="_blank" rel="noreferrer">
                    <button className="btn btn-primary"> Open in punk wallet</button>
                  </a>
                </p>
              </div>
            )}
            {!isWinner && isHacked && !game.winner && (
              <p className="text-center">
                Hidden characters found, {isSweeping ? "Trying to sweep private key..." : sweepMessage}
              </p>
            )}
            {!isWinner && isHacked && game.winner != undefined && (
              <p className="text-center">
                Hidden characters were discovered, but another wallet beat you to claiming the private key.{" "}
              </p>
            )}
            {!isWinner && !isHacked && <div>Someone else found the private key!</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAnnouncement;
