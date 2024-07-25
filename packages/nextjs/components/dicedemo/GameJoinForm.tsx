import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { InputBase } from "../scaffold-eth";
import QrReader from "react-qr-reader-es6";
import { useAccount } from "wagmi";
import { joinGame } from "~~/utils/diceDemo/apiUtils";
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

  const handleJoinGame = async (invite: string) => {
    setLoading(true);
    try {
      await joinGame(invite, playerAddress as string);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
