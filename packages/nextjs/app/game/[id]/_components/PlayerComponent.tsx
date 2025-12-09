import React, { useState, useEffect } from "react";
import Image from "next/image";
import { privateKeyToAccount } from "viem/accounts";
import { calculateLength, generateRandomHex } from "~~/utils/diceDemo/gameUtils";
import { Game } from "@prisma/client";
import PlayerAnnouncement from "~~/components/dicedemo/PlayerAnnoucement";
import useSweepWallet from "~~/hooks/useSweepWallet";

interface PlayerComponentProps {
  game: Game;
  token: string;
  address: string | undefined;
}

export const PlayerComponent = ({ game, token, address }: PlayerComponentProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [isUnitRolling, setIsUnitRolling] = useState<boolean[]>([false]);
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [rolls, setRolls] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [autoRolling, setAutoRolling] = useState(false);
  const [bruteRolling, setBruteRolling] = useState(false);
  const [isHacked, setIsHacked] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(true);

  const { sweepWallet, isSweeping, sweepMessage } = useSweepWallet({ game, token });

  const length = calculateLength(game?.diceCount as number);

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
    setIsUnitRolling(Array.from({ length: game?.diceCount }, () => false));
  }, [game?.diceCount]);

  useEffect(() => {
    let isHiddenChars;
    let pk;

    if (rolled && rolledResult.length > 0 && game?.hiddenPrivateKey) {
      const visibleSuffix = game.hiddenPrivateKey.replaceAll("*", "");
      const prefix = rolledResult.join("");
      const combined = `${prefix}${visibleSuffix}`;

      // Safety guard: private key must be exactly 32 bytes (64 hex chars).
      if (combined.length !== 64) {
        return;
      }

      pk = `0x${combined}` as `0x{string}`;
      const account = privateKeyToAccount(pk);
      isHiddenChars = account.address == game?.adminAddress;
    }

    if (isHiddenChars) {
      setAutoRolling(false);
      setBruteRolling(false);
      setIsRolling(false);
      setSpinning(false);
      setCongratsOpen(true);
      setIsHacked(true);
      sweepWallet(pk as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolledResult]);

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

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mt-6">
        {game.status === "paused" && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-warning/50 bg-warning/10 px-4 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] text-warning">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            <span>Game paused by host</span>
          </div>
        )}
        <button
          className="btn btn-primary px-10"
          onClick={() => {
            game.mode === "auto" ? setAutoRolling(true) : game.mode === "brute" ? setBruteRolling(true) : rollTheDice();
          }}
          disabled={
            isRolling || spinning || game.status == "finished" || game.status == "paused" || autoRolling || bruteRolling
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
            {Array.from({ length: game.diceCount }).map((_, index) => {
              let src, alt;

              if (rolled) {
                if (isUnitRolling[index] || (isRolling && game.mode === "brute")) {
                  src = "/rolls-gif/Spin.gif";
                  alt = "spinning";
                } else {
                  src = `/rolls-jpg/${rolls[index]}.jpg`;
                  alt = "rolled";
                }
              } else {
                src = `/rolls-jpg/0.jpg`;
                alt = "zero roll";
              }

              return (
                <Image
                  // index is fine; dice order is stable within a roll
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="transition duration-500 ease-in rounded-lg"
                  src={src}
                  alt={alt}
                  width={length}
                  height={length}
                />
              );
            })}
          </div>
        </div>
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
    </div>
  );
};
