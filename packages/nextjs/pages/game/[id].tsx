// pages/game/[id].js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Ably from "ably";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useAccount } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Condolence from "~~/components/Condolence";
import Congrats from "~~/components/Congrats";
import { Address } from "~~/components/scaffold-eth";
import { Price } from "~~/components/scaffold-eth/Price";
import useGameData from "~~/hooks/useGameData";
import serverConfig from "~~/server.config";
import { Game } from "~~/types/game/game";
import { notification } from "~~/utils/scaffold-eth";

function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  const { loadGameState, updateGameState } = useGameData();

  const { address } = useAccount();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isUnitRolling, setIsUnitRolling] = useState<boolean[]>([false]);
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [rolls, setRolls] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [game, setGame] = useState<Game>();
  const [token, setToken] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteUrlCopied, setInviteUrlCopied] = useState(false);

  const congratulatoryMessage = "Congratulations! You won the game!";
  const condolenceMessage = "Sorry Fren! You Lost";
  const [autoRolling, setAutoRolling] = useState(false);

  const [screenwidth, setScreenWidth] = useState(768);

  console.log(isUnitRolling);

  const calculateLength = () => {
    const maxLength = 200;
    const diceCount = game?.diceCount ?? 0;
    const calculatedLength = Math.max(maxLength - (diceCount - 1) * 3.8, 10);

    return calculatedLength;
  };

  const isAdmin = address == game?.adminAddress;
  const isPlayer = game?.players?.includes(address as string);

  const generateRandomHex = () => {
    const hexDigits = "0123456789abcdef";
    const randomIndex = Math.floor(Math.random() * hexDigits.length);
    return hexDigits[randomIndex];
  };

  const rollTheDice = () => {
    if (game) {
      setIsRolling(true);
      setIsUnitRolling(Array.from({ length: isUnitRolling.length }, () => true));
      if (!rolled) {
        setRolled(true);
      }
      setSpinning(true);
      const rolls: string[] = [];
      for (let index = 0; index < game?.diceCount; index++) {
        rolls.push(generateRandomHex());
      }
      setRolls(rolls);

      let iterations = 0;
      for (let i = 0; i < isUnitRolling.length; i++) {
        setTimeout(() => {
          setIsUnitRolling(prevState => {
            const newState = [...prevState];
            newState[i] = false;
            return newState;
          });
          iterations++;
          if (iterations === isUnitRolling.length) {
            setIsRolling(false);
            setTimeout(() => {
              setSpinning(false);
              setRolledResult(rolls);
            }, 5000);
          }
        }, i * 1000);
      }
    }
  };

  const length = calculateLength();
  console.log(length);

  const compareResult = () => {
    if (rolled && rolledResult.length > 0 && game?.hiddenChars)
      return rolledResult.every((value, index) => value === Object.values(game?.hiddenChars)[index]);
  };

  const endGame = async () => {
    await fetch(`${serverUrl}/game/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ winner: address }),
    });
  };

  const toggleMode = async () => {
    const response = await fetch(`${serverUrl}/admin/changemode/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: game?.mode == "manual" ? "auto" : "manual" }),
    });

    const responseData = await response.json();
    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }
  };

  const pauseResumeGame = async () => {
    const response = await fetch(`${serverUrl}/admin/${game?.status == "ongoing" ? "pause" : "resume"}/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();
    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }
  };

  const kickPlayer = async (playerAddress: string) => {
    const response = await fetch(`${serverUrl}/admin/kickplayer/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerAddress: playerAddress }),
    });

    const responseData = await response.json();
    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }
  };

  useEffect(() => {
    const { token, game: gameState } = loadGameState();

    setGame(gameState);
    setToken(token);
    setIsUnitRolling(Array.from({ length: gameState.diceCount }, () => false));

    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      const rootPath = new URL(currentUrl).origin;
      setInviteUrl(rootPath + "?invite=" + gameState.inviteCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && !isRolling) {
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  useEffect(() => {
    const isHiiddenChars = compareResult();
    if (isHiiddenChars) {
      endGame();
      setAutoRolling(false);
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolledResult]);

  useEffect(() => {
    if (!ablyApiKey) return;
    const ably = new Ably.Realtime({ key: ablyApiKey });
    const channel = ably.channels.get(`gameUpdate`);

    channel.subscribe(message => {
      if (game?._id === message.data._id) {
        setGame(message.data);
        updateGameState(JSON.stringify(message.data));
      }
    });

    return () => {
      channel.unsubscribe(`gameUpdate`);
      ably.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, ablyApiKey]);

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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const autoRoll = () => {
      if (autoRolling && game?.mode === "auto") {
        rollTheDice();
        timeout = setTimeout(autoRoll, 5500);
      }
    };

    if (game?.winner) {
      return;
    }

    autoRoll();

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRolling, game]);

  if (game) {
    return (
      <div>
        <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[50%] w-11/12 mx-auto">
          <div className="flex lg:flex-wrap md:flex-row flex-col border rounded-xl">
            <div className="md:w-1/3 border-r">
              <div className="font-bold py-2 border-b px-4 flex items-center justify-between">
                <h1 className=" md:text-2xl text-xl upercase tracking-wide ">INFO</h1>
                <h1>Role: {isAdmin ? "Host" : isPlayer ? "Player" : "Kicked"}</h1>
              </div>
              <div className="p-4 ">
                {isAdmin && (
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
                    <div className="flex justify-center mt-2 cursor-pointer">
                      {inviteUrlCopied ? (
                        <span className="underline">Copied invite Url</span>
                      ) : (
                        <CopyToClipboard
                          text={inviteUrl}
                          onCopy={() => {
                            setInviteUrlCopied(true);
                            setTimeout(() => {
                              setInviteUrlCopied(false);
                            }, 800);
                          }}
                        >
                          <span>Copy invite Url</span>
                        </CopyToClipboard>
                      )}
                    </div>
                  </div>
                )}
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
                  <div className="flex flex-col gap-2 bg-base-200 mt-2 rounded-md w-full px-4 py-2 items-center">
                    <span> Mode: {game.mode}</span>
                    {isAdmin && (
                      <div className="flex justify-around w-full">
                        <label className="flex cursor-pointer gap-2">
                          <span>Auto</span>
                          <input
                            type="radio"
                            name="radio-10"
                            className="radio checked:bg-blue-500"
                            checked={game?.mode == "auto"}
                            onClick={() => {
                              if (game?.mode == "manual") toggleMode();
                            }}
                          />
                        </label>
                        <label className="flex cursor-pointer gap-2">
                          <span>Manual</span>
                          <input
                            type="radio"
                            name="radio-10"
                            className="radio checked:bg-blue-500"
                            checked={game?.mode == "manual"}
                            onClick={() => {
                              if (game?.mode == "auto") toggleMode();
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 bg-base-300 mt-2 rounded-md w-full px-4 py-2 font-bold justify-center">
                  Prize:
                  <Price value={game.prize} />
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
                  game.mode === "auto" ? setAutoRolling(true) : rollTheDice();
                }}
                disabled={isRolling || spinning || game.status == "finished" || autoRolling}
              >
                {(spinning || autoRolling) && <span className="loading loading-spinner"></span>}
                {game.mode === "auto" ? " Auto Roll" : "Roll"}
              </button>
              <div>
                <div className="flex justify-center gap-2 mt-2">
                  <span>Result:</span>
                  {rolledResult.length > 0 && !spinning && <span className=""> {rolledResult.join(" , ")}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {Object.entries(game.hiddenChars).map(([key], index) =>
                    rolled ? (
                      isUnitRolling[index] ? (
                        <video
                          width={100}
                          height={100}
                          loop
                          src="/rolls/Spin.webm"
                          autoPlay
                          onError={e => {
                            console.log(key);
                            console.error("Spin Error", index, e);
                          }}
                        />
                      ) : (
                        <video
                          width={100}
                          height={100}
                          src={`/rolls/${rolls[index]}.webm`}
                          autoPlay
                          onError={e => console.error("Rolled Error", index, e)}
                        />
                      )
                    ) : (
                      <video ref={videoRef} width={100} height={100} src={`/rolls/0.webm`} />
                    ),
                  )}
                </div>
              </div>{" "}
              {game?.winner == address && (
                <Congrats isOpen={isOpen} setIsOpen={setIsOpen} message={congratulatoryMessage} />
              )}
              {game.winner && game?.winner != address && (
                <Condolence isOpen={isOpen} setIsOpen={setIsOpen} message={condolenceMessage} />
              )}
            </div>
          )}
          {!isAdmin && !isPlayer && <p className="text-center text-2xl">Sorry fren, You have been kicked</p>}
        </div>
      </div>
    );
  } else {
    return <div>No Game</div>;
  }
}

export default GamePage;
