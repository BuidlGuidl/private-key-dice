// pages/game/[id].js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import io from "socket.io-client";
import { useAccount } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Congrats from "~~/components/Congrats";
import { Address } from "~~/components/scaffold-eth";
import serverConfig from "~~/server.config";
import { loadGameState, updateGameState } from "~~/utils/diceDemo/game";

function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

  const { token, game: gameState } = loadGameState();
  const { address } = useAccount();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [game, setGame] = useState(gameState);
  const [isOpen, setIsOpen] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const congratulatoryMessage = "Congratulations! You won the game!";

  const [screenwidth, setScreenWidth] = useState(768);

  const calculateLength = () => {
    const maxLength = 200;
    const calculatedLength = Math.max(maxLength - (game?.diceCount - 1) * 3.8, 10);

    return calculatedLength;
  };

  const isAdmin = address == game?.adminAddress;
  const isPlayer = game?.players?.includes(address);

  const generateRandomHex = () => {
    const hexDigits = "0123456789abcdef";
    const randomIndex = Math.floor(Math.random() * hexDigits.length);
    return hexDigits[randomIndex];
  };

  const rollTheDice = () => {
    // setRolled(false);
    setIsRolling(true);

    const rolls = [];
    for (let index = 0; index < game.diceCount; index++) {
      rolls.push(generateRandomHex());
    }
    setIsRolling(false);
    setRolledResult(rolls);
    if (!rolled) {
      setRolled(true);
    }
  };

  const length = calculateLength();

  const compareResult = () => {
    if (rolled && rolledResult.length > 0)
      return rolledResult.every((value, index) => value === Object.values(game?.hiddenChars)[index]);
  };

  const endGame = async () => {
    await fetch(`${serverUrl}/game/${game._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ winner: address }),
    });
  };

  const toggleMode = async () => {
    await fetch(`${serverUrl}/admin/changemode/${game._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: game?.mode == "manual" ? "auto" : "manual" }),
    });
  };

  const pauseResumeGame = async () => {
    await fetch(`${serverUrl}/admin/${game.status == "ongoing" ? "pause" : "resume"}/${game._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const kickPlayer = async (playerAddress: string) => {
    await fetch(`${serverUrl}/admin/kickplayer/${game._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerAddress: playerAddress }),
    });
  };

  useEffect(() => {
    if (videoRef.current && !isRolling) {
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  useEffect(() => {
    const isHiiddenChars = compareResult();
    if (isHiiddenChars) {
      endGame();
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolledResult]);

  useEffect(() => {
    const socket = io(serverUrl);
    socket.on(`gameUpdate_${game?._id}`, updatedGameData => {
      setGame(updatedGameData);
      updateGameState(JSON.stringify(updatedGameData));
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
    }
    const updateScreenSize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", updateScreenSize);
    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  if (!game || game == null || id != game.inviteCode) {
    return <>null</>;
  }

  return (
    <div>
      <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[50%] w-11/12 mx-auto">
        <div className="flex lg:flex-wrap md:flex-row flex-col border rounded-xl">
          <div className="md:w-1/3 border-r">
            <div className="font-bold py-2 border-b px-4 flex items-center justify-between">
              <h1 className=" md:text-2xl text-xl upercase tracking-wide ">INFO</h1>
              <h1>Role: {isAdmin ? "Host" : "Player"}</h1>
            </div>
            <div className="p-4 ">
              <div className="p-2 bg-base-300 rounded-md">
                <div className="flex items-center justify-center">
                  <span>Invite Code: {id}</span>
                  {inviteCopied ? (
                    <CheckCircleIcon
                      className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                      aria-hidden="true"
                    />
                  ) : (
                    <CopyToClipboard
                      text={id?.toString() || ""}
                      onCopy={() => {
                        setInviteCopied(true);
                        setTimeout(() => {
                          setInviteCopied(false);
                        }, 800);
                      }}
                    >
                      <DocumentDuplicateIcon
                        className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                        aria-hidden="true"
                      />
                    </CopyToClipboard>
                  )}
                </div>
                <div>
                  <QRCode
                    value={id?.toString() || ""}
                    className=" h-full mx-auto mt-2 w-3/4"
                    level="H"
                    renderAs="svg"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 bg-base-300 mt-2 rounded-md w-full px-4 py-2">
                <div className="flex gap-2 justify-center">
                  <span> Status: {game.status}</span>
                  {isAdmin && (
                    <input
                      id="mode-toggle"
                      type="checkbox"
                      className="toggle toggle-primary bg-primary tooltip tooltip-bottom tooltip-primary"
                      data-tip={game?.status == "ongoing" ? "pause" : game?.status == "paused" ? "resume" : ""}
                      onChange={pauseResumeGame}
                      checked={game?.status == "ongoing"}
                    />
                  )}
                </div>
                <div className="flex gap-2 bg-base-200 mt-2 rounded-md w-full px-4 py-2 justify-center">
                  <span> Mode: {game.mode}</span>
                  {isAdmin && (
                    <input
                      id="mode-toggle"
                      type="checkbox"
                      className="toggle toggle-primary bg-primary tooltip tooltip-bottom tooltip-primary"
                      data-tip={game?.mode == "manual" ? "auto" : "manual"}
                      onChange={toggleMode}
                      checked={game?.mode == "manual"}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2 bg-base-300 mt-2 rounded-md w-full px-4 py-2 font-bold justify-center">
                Prize: {game.prize} ETH
              </div>
              <div className="flex gap-2 bg-base-300 mt-2 rounded-md w-full px-4 py-2 justify-center">
                Dice count: {game.diceCount}
              </div>
              {game.winner && (
                <div className="flex gap-2 bg-base-300 mt-2 rounded-md w-full px-4 py-2 justify-center">
                  Winner <Address address={game.winner} />
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <div>
              <div className="py-2 border-b md:border-t-0 border-t px-4">
                <h1 className="font-bold md:text-2xl text-xl upercase  tracking-wide md:text-left text-center ">
                  HIDDEN CHARACTERS
                </h1>
              </div>
              <p className="text-2xl p-4"> {Object.values(game?.hiddenChars).join(" , ")}</p>
            </div>
            <div className="py-2 border-b border-t px-4">
              <h1 className="font-bold md:text-2xl text-xl upercase  tracking-wide md:text-left text-center">
                PLAYERS
              </h1>
            </div>
            <div className="p-4">
              {game?.players?.map((player: string) => (
                <div key={player} className="mb-4 flex justify-between ">
                  <Address format={screenwidth > 768 ? "long" : "short"} address={player} />
                  {isAdmin && (
                    <button className="btn btn-xs btn-error" onClick={() => kickPlayer(player)}>
                      kick
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {isPlayer && (
          <div className="flex flex-col items-center mt-6">
            <button
              className="btn btn-primary px-10"
              onClick={() => {
                rollTheDice();
              }}
              disabled={isRolling || game.status == "finished" || game.mode == "auto"}
            >
              Roll
            </button>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {Object.entries(game.hiddenChars).map(([key], index) => (
                <div key={key}>
                  {rolled ? (
                    isRolling ? (
                      <video key="rolling" width={length} height={length} loop src="/rolls/Spin.webm" autoPlay />
                    ) : (
                      <video
                        key="rolled"
                        width={length}
                        height={length}
                        src={`/rolls/${rolledResult[index]}.webm`}
                        autoPlay
                      />
                    )
                  ) : (
                    <video ref={videoRef} key="last" width={length} height={length} src={`/rolls/0.webm`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {game?.winner == address && <Congrats isOpen={isOpen} setIsOpen={setIsOpen} message={congratulatoryMessage} />}
    </div>
  );
}

export default GamePage;
