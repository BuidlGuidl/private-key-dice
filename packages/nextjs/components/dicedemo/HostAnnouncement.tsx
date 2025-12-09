import { Dispatch, SetStateAction } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "../scaffold-eth";
import { Game } from "@prisma/client";

const CONFETTI_COLORS = ["#34d399", "#60a5fa", "#f97316", "#facc15", "#a855f7"];
const CONFETTI_PIECES = 70;

const HostAnnouncement = ({
  isOpen,
  setIsOpen,
  game,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  game: Game;
}) => {
  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <div className="overflow-hidden w-fit text-xl bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-base-300/40 backdrop-blur-sm">
          {/* Full-screen confetti layer */}
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

          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="modal-box relative flex max-w-lg flex-col items-center gap-4 text-center">
              <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2 z-10">
                ✕
              </label>

              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-base-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Game finished</span>
                </div>
                <h2 className="bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                  The heist has a winner
                </h2>
                <p className="text-sm text-base-content/70 md:text-base">
                  Prize claimed by:
                </p>
                <div className="rounded-xl bg-base-200/70 px-4 py-2">
                  <Address address={game.winner as string} format="long" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostAnnouncement;
