import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";
import useGameData from "~~/hooks/useGameData";
import serverConfig from "~~/server.config";
import { updateGameState } from "~~/utils/diceDemo/game";
import { notification } from "~~/utils/scaffold-eth";

interface FormData {
  diceCount: number;
  hiddenPrivateKey: string;
  adminAddress: string | undefined;
}

const RestartWithNewPk = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
  const closePopup = () => {
    setIsOpen(false);
  };
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;
  const { loadGameState } = useGameData();
  const { token, game } = loadGameState();
  const [sliderValue, setSliderValue] = useState(1);
  const [newPk, setNewPk] = useState("");
  const [hexPk, setHexPk] = useState("");
  const [formData, setFormData] = useState<FormData>({
    diceCount: 0,
    hiddenPrivateKey: "",
    adminAddress: undefined,
  });

  const handleRestart = async () => {
    const response = await fetch(`${serverUrl}/admin/restartwithnewpk/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }
    const currentPrivateKey = window.localStorage.getItem("scaffoldEth2.burnerWallet.sk");
    if (currentPrivateKey) {
      window.localStorage.setItem("scaffoldEth2.burnerWallet.sk_backup" + Date.now(), currentPrivateKey);
    }
    window.localStorage.setItem("scaffoldEth2.burnerWallet.sk", hexPk);
    updateGameState(responseData);
    notification.success("Restarted game successfully");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSliderValue(value);

    const selectedSlots = Array.from({ length: value }, (_, i) => i);
    createHiddenCharObject(selectedSlots);
  };

  const createHiddenCharObject = (selectedSlots: number[]) => {
    const characterObject: { [key: number]: string } = {};
    const selectedCharacters = newPk.split("").filter((char, index) => selectedSlots.includes(index));
    selectedCharacters.forEach((char, index) => {
      const selectedIndex = selectedSlots[index];
      characterObject[selectedIndex] = char;
    });

    setFormData(formData => ({
      ...formData,
      diceCount: selectedSlots.length,
      hiddenPrivateKey: "*".repeat(selectedSlots.length) + newPk.slice(selectedSlots.length),
    }));
  };

  useEffect(() => {
    const privateKey = generatePrivateKey();
    const pk = privateKey.substring(2);
    const account = privateKeyToAccount(privateKey as Hex);
    setNewPk(pk);
    setHexPk(privateKey);
    setFormData(formData => ({
      ...formData,
      diceCount: 1,
      adminAddress: account.address,
      hiddenPrivateKey: "*" + pk.slice(1),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className=" overflow-hidden w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-sm text-[0.7rem]">
          <div className="modal-box flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <p className="text-center mt-4">You are about to create a new game</p>
            <label className="block">
              <h1 className=" mb-4">Choose the Number of Dice (1-64)</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="64"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="slider appearance-none w-full h-2 bg-primary rounded outline-none slider-thumb "
                />
                <span className="slider-value p-2 bg-primary  font-bold rounded-md">{sliderValue}</span>
              </div>
            </label>
            <button
              type="button"
              onClick={() => {
                handleRestart();
              }}
              className="btn btn-primary"
            >
              Generate new PK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestartWithNewPk;
