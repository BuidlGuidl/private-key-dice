import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { InputBase } from "../scaffold-eth";
import QrReader from "react-qr-reader-es6";
import { useAccount } from "wagmi";
import serverConfig from "~~/server.config";
import { saveGameState } from "~~/utils/diceDemo/game";
import { notification } from "~~/utils/scaffold-eth";

const GameJoinForm = ({
  inviteCode,
  setInviteCode,
}: {
  inviteCode: string;
  setInviteCode: Dispatch<SetStateAction<string>>;
}) => {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const { invite } = router.query;

  const handleChange = (value: string) => {
    setInviteCode(value);
  };

  const { address: playerAddress } = useAccount();
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

  const handleJoinGame = async (invite: string) => {
    setLoading(true);
    const response = await fetch(`${serverUrl}/player/join`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteCode: invite, playerAddress }),
    });

    const updatedGame = await response.json();
    saveGameState(JSON.stringify(updatedGame));
    setLoading(false);
    if (updatedGame.error) {
      notification.error(updatedGame.error);
      return;
    }
    await router.push({
      pathname: `/game/[id]`,
      query: { id: invite },
    });
    notification.success("Joined game successfully");

    setInviteCode("");
  };

  const handleScan = (data: string | null) => {
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

  // const openCamera = () => {
  //   setScanning(true);
  // };

  useEffect(() => {
    if (invite && playerAddress) {
      handleJoinGame(invite as string);
    }
    if (Object.keys(router.query).length > 0) {
      router.replace({
        pathname: router.pathname,
        query: {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite, playerAddress]);

  return (
    <div className="w-full">
      <div>
        <label>
          <h1 className=" mb-4"> Enter Invite Code</h1>
          <InputBase
            name="inviteCode"
            value={inviteCode}
            placeholder="Invite Code"
            onChange={handleChange}
            // suffix={
            //   <button type="button" className={`btn btn-primary h-[2.2rem] min-h-[2.2rem] `} onClick={openCamera}>
            //     Scan
            //   </button>
            // }
          />
        </label>
        <button className="btn btn-sm btn-primary mt-4 " type="button" onClick={() => handleJoinGame(inviteCode)}>
          {loading && <span className="loading loading-spinner"></span>}
          Join Game
        </button>
      </div>

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
