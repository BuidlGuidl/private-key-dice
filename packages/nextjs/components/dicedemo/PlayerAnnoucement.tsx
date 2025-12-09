import { Dispatch, SetStateAction } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Game } from "@prisma/client";
import { loadBurnerSK } from "~~/hooks/scaffold-eth/useBurnerWallet";

const CONFETTI_COLORS = ["#34d399", "#60a5fa", "#f97316", "#facc15", "#a855f7"];
const CONFETTI_PIECES = 70;

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
    <div className="overflow-hidden w-fit text-lg bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-base-300/40 backdrop-blur-sm">
          {/* Full-screen confetti for winner */}
          {isWinner && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: CONFETTI_PIECES }).map((_, index) => (
                // index is fine here; this list is static for the lifetime of the modal
                // eslint-disable-next-line react/no-array-index-key
                <span
                  key={index}
                  className="confetti-piece"
                  style={{
                    left: `${(index / CONFETTI_PIECES) * 100}%`,
                    backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                    animationDelay: `${(index % 10) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="modal-box relative flex max-w-lg flex-col items-center py-4 pt-6 text-center">
              <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2 z-10">
                ✕
              </label>

              {isWinner && (
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-base-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                    <SparklesIcon className="h-4 w-4" />
                    <span>You won the heist</span>
                  </div>
                  <p className="max-w-md text-sm text-base-content/80 md:text-base">
                    Congrats, you found the hidden characters and have successfully swept the private key.
                  </p>
                  <a className="font-semibold italic text-base md:text-lg" href={pwlink} target="_blank" rel="noreferrer">
                    <button className="btn btn-primary">Open in Punk Wallet</button>
                  </a>
                </div>
              )}

              {!isWinner && isHacked && !game.winner && (
                <p className="mt-2 max-w-md text-center text-sm text-base-content/80 md:text-base">
                  Hidden characters found, {isSweeping ? "trying to sweep private key..." : sweepMessage}
                </p>
              )}

              {!isWinner && isHacked && game.winner != undefined && (
                <p className="mt-2 max-w-md text-center text-sm text-base-content/80 md:text-base">
                  Hidden characters were discovered, but another wallet beat you to claiming the private key.
                </p>
              )}

              {!isWinner && !isHacked && (
                <div className="mt-2 max-w-md text-center text-sm text-base-content/80 md:text-base">
                  Someone else discovered the hidden characters and claimed the private key.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAnnouncement;
