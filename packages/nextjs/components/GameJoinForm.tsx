import React, { useState } from "react";
import { useRouter } from "next/router";
import { InputBase } from "./scaffold-eth";
import QrReader from "react-qr-reader-es6";
import { useAccount } from "wagmi";
import serverConfig from "~~/server.config";
import { saveGameState } from "~~/utils/diceDemo/game";

const GameJoinForm = () => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleChange = (value: string) => {
    setInviteCode(value);
  };

  const { address: playerAddress } = useAccount();
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

  const handleJoinGame = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`${serverUrl}/player/join`, {
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

  const handleScan = data => {
    if (data) {
      setTimeout(() => {
        setInviteCode(data);
      }, 250);
      setScanning(false);
    }
  };

  const handleError = (err: Error) => {
    console.error(err.message);
    setScanning(false);
  };

  const openCamera = () => {
    setScanning(true);
  };

  return (
    <div className="">
      <form onSubmit={handleJoinGame}>
        <h1> Enter Invite Code</h1>
        <InputBase
          name="inviteCode"
          value={inviteCode}
          placeholder="Invite Code"
          onChange={handleChange}
          suffix={
            <button type="button" className={`btn btn-primary h-[2.2rem] min-h-[2.2rem] `} onClick={openCamera}>
              Scan
            </button>
          }
        />
        <button className="btn btn-sm btn-primary mt-6" type="submit">
          Join Game
        </button>
      </form>

      {scanning && (
        <div
          className="p-6 md:relative fixed inset-0 flex items-center justify-center  bg-opacity-50  md:text-base text-[0.8rem]"
          onClick={() => setScanning(false)}
        >
          <div className="w-full max-w-sm">
            <QrReader
              delay={300}
              resolution={1200}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameJoinForm;
