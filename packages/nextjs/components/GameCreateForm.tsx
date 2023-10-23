import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { EtherInput, InputBase } from "./scaffold-eth";
import { useAccount } from "wagmi";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import serverConfig from "~~/server.config";
import { saveGameState } from "~~/utils/diceDemo/game";

interface FormData {
  maxPlayers: number;
  diceCount: number;
  mode: "auto" | "manual";
  privateKey: string;
  hiddenChars: {
    number?: string;
  };
  prize: string;
  adminAddress: string | undefined;
}

const GameCreationForm = () => {
  const router = useRouter();
  const { address: adminAddress } = useAccount();

  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

  const [formData, setFormData] = useState<FormData>({
    maxPlayers: 5,
    diceCount: 0,
    mode: "manual",
    privateKey: loadBurnerSK().toString().substring(2),
    hiddenChars: {},
    prize: "0",
    adminAddress,
  });
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    const pk = loadBurnerSK().toString().substring(2);
    setPrivateKey(pk);
  }, []);

  const handlePlayersChange = (value: number) => {
    setFormData({ ...formData, maxPlayers: value });
  };

  const handlePrizeChange = (value: string) => {
    setFormData({ ...formData, prize: value });
  };

  const handleModeChange = (value: "auto" | "manual") => {
    setFormData({ ...formData, mode: value });
  };

  const handleCharClick = (index: number) => {
    const updatedSelectedSlots = [...selectedSlots];

    if (updatedSelectedSlots.includes(index)) {
      const indexToRemove = updatedSelectedSlots.indexOf(index);
      updatedSelectedSlots.splice(indexToRemove, 1);
    } else {
      updatedSelectedSlots.push(index);
    }
    setSelectedSlots(updatedSelectedSlots.sort((a, b) => a - b));

    setFormData({
      ...formData,
      diceCount: updatedSelectedSlots.length,
    });
  };

  const createHiddenCharObject = (selectedSlots: number[]) => {
    const characterObject: { [key: number]: string } = {};

    const selectedCharacters = privateKey.split("").filter((char, index) => selectedSlots.includes(index));

    selectedCharacters.forEach((char, index) => {
      const selectedIndex = selectedSlots[index];
      characterObject[selectedIndex] = char;
    });

    setFormData({
      ...formData,
      hiddenChars: characterObject,
    });
  };

  const handleSubmit = async () => {
    console.log(formData);
    const createGameResponse = await fetch(`${serverUrl}/admin/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const createdGame = await createGameResponse.json();
    saveGameState(JSON.stringify(createdGame));
    router.push({
      pathname: `/game/[id]`,
      query: { id: createdGame.game.inviteCode },
    });

    setFormData({
      maxPlayers: 5,
      diceCount: 0,
      mode: "auto",
      privateKey: loadBurnerSK(),
      hiddenChars: {},
      prize: "0",
      adminAddress,
    });
  };

  useEffect(() => {
    createHiddenCharObject(selectedSlots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlots]);

  useEffect(() => {
    setFormData({
      ...formData,
      adminAddress: adminAddress,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAddress]);

  return (
    <div>
      <form>
        <label>
          <h1> Select Private Key Slots to Hide</h1>
          <div className="grid md:grid-cols-10 grid-cols-8 mt-5">
            {privateKey.split("").map((char, index) => (
              <div
                key={index}
                className={`cursor-pointer hover:scale-120 hover:bg-gray-300 border p-3 text-center  ${
                  selectedSlots.includes(index) ? "bg-primary hover:bg-primary" : ""
                }`}
                onClick={() => handleCharClick(index)}
              >
                {char}
              </div>
            ))}
          </div>
        </label>
        <br />
        <label>
          <h1> No of Players</h1>
          <InputBase
            min={"5"}
            max={"30"}
            name="maxPlayers"
            type="number"
            value={formData.maxPlayers}
            onChange={value => handlePlayersChange(value)}
          />
        </label>
        <br />
        <label>
          <h1>Mode</h1>
          <ul className="menu menu-horizontal menu-xs bg-base-300 rounded-md activemenu">
            <li value="manual" onClick={() => handleModeChange("manual")}>
              <a
                className={
                  formData.mode === "manual"
                    ? "bg-base-100 px-3 rounded-full py-1 cursor-pointer hover:bg-secondary transition ease-in-out delay-150"
                    : "px-3 rounded-full py-1 cursor-pointer hover:bg-secondary"
                }
              >
                Manual
              </a>
            </li>
            <li value="auto" onClick={() => handleModeChange("auto")}>
              <a
                className={
                  formData.mode === "auto"
                    ? "bg-base-100 px-3 rounded-full py-1 cursor-pointer hover:bg-secondary transition ease-in-out delay-150"
                    : "px-3 rounded-full py-1 cursor-pointer hover:bg-secondary"
                }
              >
                Auto
              </a>
            </li>
          </ul>
        </label>
        <br />
        <br />
        <label>
          <h1>Prize</h1>
          <EtherInput value={formData.prize} onChange={handlePrizeChange} />
        </label>
        <br />
        <button
          disabled={parseFloat(formData.prize) == 0 || formData.prize == "" || selectedSlots.length == 0}
          type="button"
          onClick={handleSubmit}
          className="btn  btn-primary"
        >
          Create Game
        </button>
      </form>
    </div>
  );
};

export default GameCreationForm;
