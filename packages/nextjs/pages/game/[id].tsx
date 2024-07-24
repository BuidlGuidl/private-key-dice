import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Ably from "ably";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useAccount, useBalance } from "wagmi";
import {
  CheckCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import HostAnnouncement from "~~/components/dicedemo/HostAnnouncement";
import PlayerAnnouncement from "~~/components/dicedemo/PlayerAnnoucement";
import RestartWithNewPk from "~~/components/dicedemo/RestartWithNewPk";
import { Address } from "~~/components/scaffold-eth";
import { Price } from "~~/components/scaffold-eth/Price";
import useGameData from "~~/hooks/useGameData";
import useSweepWallet from "~~/hooks/useSweepWallet";
import { Game } from "~~/types/game/game";
import { kickPlayer, pauseResumeGame, toggleMode, varyHiddenPrivatekey } from "~~/utils/diceDemo/apiUtils";
import { calculateLength, compareResult, generateRandomHex } from "~~/utils/diceDemo/gameUtils";
import { privateKeyToAccount } from "viem/accounts";

function GamePage() {
  const router = useRouter();
  const { id } = router.query;
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  const { loadGameState, updateGameState } = useGameData();

  const { address } = useAccount();

  const [isRolling, setIsRolling] = useState(false);
  const [isUnitRolling, setIsUnitRolling] = useState<boolean[]>([false]);
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [rolls, setRolls] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [game, setGame] = useState<Game>();
  const [token, setToken] = useState("");
  const [congratsOpen, setCongratsOpen] = useState(true);
  const [hostAnnOpen, setHostAnnOpen] = useState(true);
  const [restartOpen, setRestartOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteUrlCopied, setInviteUrlCopied] = useState(false);
  const [autoRolling, setAutoRolling] = useState(false);
  const [bruteRolling, setBruteRolling] = useState(false);
  const [screenwidth, setScreenWidth] = useState(768);
  const [isHacked, setIsHacked] = useState(false);

  const prize = useBalance({ address: game?.adminAddress });
  const { sweepWallet, isSweeping, sweepMessage } = useSweepWallet({ game, token });

  const length = calculateLength(game?.diceCount as number);

  const isAdmin = address == game?.adminAddress;
  const isPlayer = game?.players?.includes(address as string);

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
      setTimeout(() => {
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
              }, 500);
            }
          }, i * 800);
        }
      }, 800);
    }
  };

  const bruteRoll = () => {
    if (game) {
      setIsRolling(true);
      if (!rolled) {
        setRolled(true);
      }
      setSpinning(true);
      const rolls: string[] = [];
      for (let index = 0; index < game?.diceCount; index++) {
        rolls.push(generateRandomHex());
      }
      setRolls(rolls);
      setSpinning(false);
      setRolledResult(rolls);
    }
  };

  useEffect(() => {
    const { token, game: gameState } = loadGameState();
    setGame(gameState);
    setToken(token);
    setIsUnitRolling(Array.from({ length: gameState?.diceCount }, () => false));

    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      const rootPath = new URL(currentUrl).origin;
      setInviteUrl(rootPath + "?invite=" + gameState?.inviteCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isHiiddenChars;

    if (rolled && rolledResult.length > 0 && game?.hiddenPrivateKey) {
      const pk: `0x{string}` = `0x${rolledResult.join("")}${game?.hiddenPrivateKey.replaceAll("*", "")}` as `0x{string}`;
      const account = privateKeyToAccount(pk);
      isHiiddenChars = account.address == game?.adminAddress;
    }

    if (isHiiddenChars) {
      setAutoRolling(false);
      setBruteRolling(false);
      setIsRolling(false);
      setSpinning(false);
      setCongratsOpen(true);
      setIsHacked(true);
      sweepWallet(game?.privateKey as string);
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
        timeout = setTimeout(autoRoll, game?.diceCount * 800 + 1500);
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

  useEffect(() => {
    if (game?.winner) {
      setIsRolling(false);
      return;
    }

    if (bruteRolling && game?.mode === "brute") {
      const intervalId = setInterval(() => {
        bruteRoll();
      }, 1);

      return () => clearInterval(intervalId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bruteRolling, game]);

  useEffect(() => {
    if (game?.status == "paused") {
      setAutoRolling(false);
      setBruteRolling(false);
      setIsRolling(false);
      setSpinning(false);
    }
    if (game?.winner) {
      setIsRolling(false);
      setHostAnnOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  useEffect(() => {
    setAutoRolling(false);
    setBruteRolling(false);
    setIsRolling(false);
    setSpinning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.mode]);

  if (game) {
    return (
      <div>
        <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[55%] w-11/12 mx-auto bg-secondary p-10  items-center justify-center md:text-8xl text-6xl rounded-md shadow-md">
          <Price value={Number(prize.data?.formatted)} />
        </div>
        <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[55%] w-11/12 mx-auto rounded-xl bg-secondary shadow-md overflow-hidden">
          <div className="flex  md:flex-row flex-col rounded-xl overflow-hidden md:max-h-[40rem]">
            <div className="md:w-1/3 md:border-r-white border-2 ">
              {isAdmin && (
                <div className="py-2">
                  <div className="p-2 bg-base-200 mt-2 rounded-md px-4 w-[95%] mx-auto">
                    <div className="flex items-center justify-center ">
                      <span>Copy Invite Url</span>
                      {inviteUrlCopied ? (
                        <CheckCircleIcon
                          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                          aria-hidden="true"
                        />
                      ) : (
                        <CopyToClipboard
                          text={inviteUrl?.toString() || ""}
                          onCopy={() => {
                            setInviteUrlCopied(true);
                            setTimeout(() => {
                              setInviteUrlCopied(false);
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
                        value={inviteUrl?.toString() || ""}
                        className=" h-full mx-auto mt-2 w-3/4"
                        level="H"
                        renderAs="svg"
                      />
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <span>Invite: {id?.toString()}</span>
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
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-base-200 mt-2 rounded-md w-[95%] mx-auto px-4 py-2 ">
                    <div className="flex gap-2 justify-center">
                      <span> Status: {game.status}</span>

                      <input
                        id="mode-toggle"
                        type="checkbox"
                        className="toggle toggle-primary bg-primary tooltip tooltip-bottom tooltip-primary"
                        data-tip={game?.status == "ongoing" ? "pause" : game?.status == "paused" ? "resume" : ""}
                        onChange={() => pauseResumeGame(game, token)}
                        checked={game?.status == "ongoing"}
                      />
                    </div>
                    <div className="flex flex-col gap-2 bg-secondary mt-2 rounded-md w-full px-4 py-2 items-center">
                      <span> Mode: {game.mode}</span>

                      <div className="flex justify-around w-full flex-wrap gap-1">
                        <label className="flex cursor-pointer gap-2">
                          <span>Auto</span>
                          <input
                            type="radio"
                            name="radio-10"
                            className="radio checked:bg-blue-500"
                            checked={game?.mode == "auto"}
                            onClick={() => {
                              if (game?.mode != "auto") toggleMode(game, "auto", token);
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
                              if (game?.mode != "manual") toggleMode(game, "manual", token);
                            }}
                          />
                        </label>
                        <label className="flex cursor-pointer gap-2">
                          <span>Brute</span>
                          <input
                            type="radio"
                            name="radio-10"
                            className="radio checked:bg-blue-500"
                            checked={game?.mode == "brute"}
                            onClick={() => {
                              if (game?.mode != "brute") toggleMode(game, "brute", token);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {screenwidth <= 768 && (
                    <div>
                      <div className="font-bold py-2 border-y-white border-2 flex items-center px-4 justify-center my-2 ">
                        <h1 className=" tracking-wide">PRIVATE KEY</h1>
                      </div>
                      <div className="flex items-center">
                        <p className=" whitespace-normal break-words px-2 blur transition duration-500 ease-in-out hover:blur-none cursor-pointer w-[90%]">
                          {Object.values(game?.hiddenPrivateKey)}
                        </p>
                        <div>
                          <button
                            className="btn btn-sm btn-ghost tooltip tooltip-left"
                            data-tip="increase"
                            onClick={() => {
                              varyHiddenPrivatekey(game, token, "increase");
                            }}
                          >
                            <ChevronDoubleUpIcon className="text-xl font-bold  h-5 w-5 " aria-hidden="true" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost tooltip tooltip-left"
                            data-tip="decrease"
                            onClick={() => {
                              varyHiddenPrivatekey(game, token, "decrease");
                            }}
                          >
                            <ChevronDoubleDownIcon className="text-xl font-bold h-5 w-5 " aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {game.winner && (
                <div className="flex gap-2 bg-base-300 rounded-md px-4 mt-2 mb-2 py-2 justify-center w-[95%] mx-auto">
                  Winner <Address address={game?.winner} />
                </div>
              )}
              {/* {isAdmin && game.winner && (
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    setRestartOpen(true);
                  }}
                >
                  Restart with New PK
                </button>
              )} */}
            </div>
            {screenwidth > 768 && (
              <div className="md:w-2/3">
                {isAdmin && (
                  <div>
                    <div className="font-bold py-2 border-b-white border-2 flex items-center px-4  ">
                      <h1 className=" tracking-wide md:text-xl text-lg md:text-left text-center ">PRIVATE KEY</h1>
                    </div>
                    <div className="flex items-center">
                      <p className="whitespace-normal break-words px-2 blur transition duration-500 ease-in-out hover:blur-none text-lg cursor-pointer w-[90%]">
                        {Object.values(game?.hiddenPrivateKey)}
                      </p>
                      <div>
                        <button
                          className="btn btn-sm btn-ghost tooltip tooltip-left"
                          data-tip="increase"
                          onClick={() => {
                            varyHiddenPrivatekey(game, token, "increase");
                          }}
                        >
                          <ChevronDoubleUpIcon className="text-xl font-bold  h-5 w-5 " aria-hidden="true" />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost tooltip tooltip-left"
                          data-tip="decrease"
                          onClick={() => {
                            varyHiddenPrivatekey(game, token, "decrease");
                          }}
                        >
                          <ChevronDoubleDownIcon className="text-xl font-bold h-5 w-5 " aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="py-2 border-y-white border-2 px-4">
                    <h1 className="font-bold md:text-xl text-lg  tracking-wide md:text-left text-center">
                      PLAYERS: {game?.players.length}
                    </h1>
                  </div>
                  {isAdmin && (
                    <div
                      className={isAdmin ? "p-4 overflow-scroll max-h-[28rem]" : "p-4 overflow-scroll max-h-[15rem]"}
                    >
                      {game?.players?.map((player: string) => (
                        <div key={player} className="mb-4 flex justify-between">
                          <Address format={"long"} address={player} />
                          {isAdmin && (
                            <button className="btn btn-xs btn-error" onClick={() => kickPlayer(game, token, player)}>
                              kick
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {isPlayer && (
            <div className="flex flex-col items-center mt-6">
              <button
                className="btn btn-primary px-10"
                onClick={() => {
                  game.mode === "auto"
                    ? setAutoRolling(true)
                    : game.mode === "brute"
                      ? setBruteRolling(true)
                      : rollTheDice();
                }}
                disabled={
                  isRolling ||
                  spinning ||
                  game.status == "finished" ||
                  game.status == "paused" ||
                  autoRolling ||
                  bruteRolling
                }
              >
                {(spinning || autoRolling) && <span className="loading loading-spinner"></span>}
                {game.mode === "auto" ? " Auto Roll" : game.mode === "brute" ? "Brute Roll" : "Roll"}
              </button>
              <div>
                {game.mode == "brute" && (
                  <div>
                    <div className="flex justify-center gap-2 mt-2">
                      <span>Result:</span>
                      {rolledResult.length > 0 && !spinning && <span className=""> {rolledResult.join(" , ")}</span>}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-8 py-2">
                  {rolls.map((value, index) =>
                    rolled ? (
                      isUnitRolling[index] || (isRolling && game.mode == "brute") ? (
                        <Image
                          className="transition duration-500 opacity-100 rounded-lg"
                          key={index}
                          src="/rolls-gif/Spin.gif"
                          alt="spinning"
                          width={length}
                          height={length}
                        />
                      ) : (
                        <Image
                          className="transition  duration-500 ease-in rounded-lg"
                          key={index}
                          src={`/rolls-jpg/${value}.jpg`}
                          alt="rolled"
                          width={length}
                          height={length}
                        />
                      )
                    ) : (
                      <Image
                        className="rounded-lg"
                        key={index}
                        src={`/rolls-jpg/0.jpg`}
                        alt="zero roll"
                        width={length}
                        height={length}
                      />
                    ),
                  )}
                </div>
              </div>{" "}
              {(isHacked || game.winner) && (
                <PlayerAnnouncement
                  isOpen={congratsOpen}
                  setIsOpen={setCongratsOpen}
                  isHacked={isHacked}
                  isWinner={game.winner == address}
                  game={game}
                  isSweeping={isSweeping}
                  sweepMessage={sweepMessage}
                />
              )}
            </div>
          )}
          {isAdmin && game.winner && (
            <div>
              <HostAnnouncement game={game} setIsOpen={setHostAnnOpen} isOpen={hostAnnOpen} />
            </div>
          )}
          {screenwidth <= 768 && game.players.length > 0 && (
            <div className="md:w-2/3 rounded-xl border-white border-2 overflow-hidden mt-5">
              <div>
                <div className="py-2 border-b-white border-2 px-4">
                  <h1 className="font-bold md:text-xl text-lg  tracking-wide md:text-left text-center">PLAYERS</h1>
                </div>
                <div className="p-4 max-h-[30rem] overflow-scroll">
                  {game?.players?.map((player: string) => (
                    <div key={player} className="mb-4 flex justify-between ">
                      <Address format={"short"} address={player} />
                      {isAdmin && (
                        <button className="btn btn-xs btn-error" onClick={() => kickPlayer(game, token, player)}>
                          kick
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {isAdmin && game.winner && <RestartWithNewPk isOpen={restartOpen} setIsOpen={setRestartOpen} />}
          {!isAdmin && !isPlayer && <p className="text-center text-2xl">You have been kicked</p>}
        </div>
      </div>
    );
  } else {
    return (
      <div className=" mt-20 lg:text-3xl lg:px-56 px-5 text-lg h-screen">
        <p className="text-center">
          Oops, it appears that you are attempting to access a game that doesn&apos;t exist or to which access has been
          lost. Please return to the homepage to join a new game.
        </p>
      </div>
    );
  }
}

export default GamePage;
