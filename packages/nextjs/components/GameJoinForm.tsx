import React, { useState } from "react";
import { useRouter } from "next/router";
import { InputBase } from "./scaffold-eth";
import { useAccount } from "wagmi";
import { saveGameState } from "~~/utils/diceDemo/game";

const GameJoinForm = () => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const handleChange = (value: string) => {
    setInviteCode(value);
  };

  const { address: playerAddress } = useAccount();

  const handleJoinGame = async () => {
    const response = await fetch(`http://localhost:4001/player/join`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteCode, playerAddress }),
    });
    const updatedGame = await response.json();

    saveGameState(JSON.stringify(updatedGame));
    router.push({
      pathname: `/game/[id]`,
      query: { id: inviteCode },
    });

    setInviteCode("");
  };

  return (
    <div className="w-full">
      <h1> Enter Invite Code</h1>
      <InputBase name="inviteCode" value={inviteCode} placeholder="Invite Code" onChange={handleChange} />
      <button className="btn btn-primary mt-6" onClick={handleJoinGame}>
        Join Game
      </button>
    </div>
  );
};

export default GameJoinForm;
