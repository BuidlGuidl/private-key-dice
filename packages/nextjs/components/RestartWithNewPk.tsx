import { Dispatch, SetStateAction } from "react";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";
import useGameData from "~~/hooks/useGameData";
import serverConfig from "~~/server.config";
import { notification } from "~~/utils/scaffold-eth";

const RestartWithNewPk = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
  const closePopup = () => {
    setIsOpen(false);
  };
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;
  const { loadGameState } = useGameData();
  const { token, game } = loadGameState();

  const handleRestart = () => {
    const currentPrivateKey = window.localStorage.getItem("scaffoldEth2.burnerWallet.sk");
    if (currentPrivateKey) {
      window.localStorage.setItem("scaffoldEth2.burnerWallet.sk_backup" + Date.now(), currentPrivateKey);
    }
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey as Hex);
    restartGameWithNewPk("", privateKey, "", account);
    window.localStorage.setItem("scaffoldEth2.burnerWallet.sk", privateKey);
    window.location.reload();
  };

  const restartGameWithNewPk = async (hiddenChars, privateKey, hiddenPrivateKey, adminAddress) => {
    const response = await fetch(`${serverUrl}/admin/restartwithnewpk/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hiddenChars, privateKey, hiddenPrivateKey, adminAddress }),
    });

    const responseData = await response.json();
    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }

    notification.success("Created game successfully");
  };

  return (
    <div className=" overflow-hidden w-fit text-xs bg-base-200 h-full">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20 md:text-sm text-[0.7rem]">
          <div className="modal-box flex flex-col items-center">
            <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <p className="text-center mt-4">You are about to create a new game</p>
            <button
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
