import { Dispatch, SetStateAction } from "react";
import { Address } from "../scaffold-eth";
import { Game } from "~~/types/game/game";

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
    <div className=" overflow-hidden w-fit text-xl bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-20">
          <div className="modal-box md:h-[30%] flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <p className="text-center">The Winner is</p>
            <Address address={game.winner as string} format="long" />
            <p className="mt-5 text-2xl text-center">
              The hidden characters are: {Object.values(game.hiddenChars).join(", ").toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostAnnouncement;
