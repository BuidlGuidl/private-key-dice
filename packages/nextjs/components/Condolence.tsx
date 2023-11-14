import { Dispatch, SetStateAction } from "react";

const Condolence = ({
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

  return (
    <div className=" overflow-hidden w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-sm text-[0.7rem]">
          <div className="modal-box flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <p className="text-center mt-4">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Condolence;
