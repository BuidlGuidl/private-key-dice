"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { loadBurnerSK } from "~~/hooks/scaffold-eth/useBurnerWallet";
import { saveGameState } from "~~/utils/diceDemo/game";
import { notification } from "~~/utils/scaffold-eth";

interface FormData {
  diceCount: number;
  mode: "auto" | "manual" | "brute";
  hiddenPrivateKey: string;
  adminAddress: string | undefined;
}

const GameCreationForm = () => {
  const router = useRouter();
  const { address: adminAddress } = useAccount();

  const initialPrivateKey = loadBurnerSK().toString().substring(2);

  const [formData, setFormData] = useState<FormData>({
    diceCount: 1,
    mode: "manual",
    hiddenPrivateKey: "*" + initialPrivateKey.slice(1),
    adminAddress,
  });

  const [privateKey, setPrivateKey] = useState("");
  const [sliderValue, setSliderValue] = useState(1);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    setPrivateKey(initialPrivateKey);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrivateKey]);

  const createHiddenCharObject = (selectedSlots: number[]) => {
    const characterObject: { [key: number]: string } = {};

    const selectedCharacters = privateKey.split("").filter((char, index) => selectedSlots.includes(index));

    selectedCharacters.forEach((char, index) => {
      const selectedIndex = selectedSlots[index];
      characterObject[selectedIndex] = char;
    });

    setFormData(formData => ({
      ...formData,
      diceCount: selectedSlots.length,
      hiddenPrivateKey: "*".repeat(selectedSlots.length) + privateKey.slice(selectedSlots.length),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setloading(true);
      const createGameResponse = await fetch(`api/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const createdGame = await createGameResponse.json();
      saveGameState(JSON.stringify(createdGame));
      router.push(`/game/${createdGame.game.inviteCode}`);
      notification.success("Created game successfully");
    } catch (error) {
      notification.error("Something went wrong");
    } finally {
      setloading(false);

      setFormData({
        diceCount: 0,
        mode: "auto",
        hiddenPrivateKey: "",
        adminAddress,
      });
    }
  };

  useEffect(() => {
    setFormData({
      ...formData,
      adminAddress: adminAddress,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAddress]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSliderValue(value);

    const selectedSlots = Array.from({ length: value }, (_, i) => i);
    createHiddenCharObject(selectedSlots);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <label className="block">
          <h1 className=" mb-3 ">Choose the Number of Dice (1-64)</h1>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="64"
              value={sliderValue}
              onChange={handleSliderChange}
              className="slider appearance-none w-[87%] h-2 bg-primary rounded outline-none slider-thumb "
            />
            <span className="slider-value p-2 bg-primary w-[13%] font-bold rounded-md flex justify-center">
              {sliderValue}
            </span>
          </div>
        </label>
        <br />
        <button type="submit" className="btn btn-sm  btn-primary -mt-2 ">
          {loading && <span className="loading loading-spinner"></span>}
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameCreationForm;
