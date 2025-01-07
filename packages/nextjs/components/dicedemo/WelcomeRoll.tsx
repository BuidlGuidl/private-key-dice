"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Address, Balance } from "../scaffold-eth";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { generateRandomHex } from "~~/utils/diceDemo/gameUtils";

const WelcomeRoll = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [isUnitRolling, setIsUnitRolling] = useState<boolean[]>(Array(64).fill(false));
  const [rolled, setRolled] = useState(false);
  const [rolledResult, setRolledResult] = useState<string[]>([]);
  const [rolls, setRolls] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [isHacked, setIsHacked] = useState(false);
  const [rolledAddress, setRolledAddress] = useState("");

  const privateKey = generatePrivateKey();
  const pk = privateKey.substring(2);

  const rollTheDice = () => {
    setRolledAddress("");
    setIsRolling(true);
    setIsUnitRolling(Array.from({ length: isUnitRolling.length }, () => true));
    if (!rolled) {
      setRolled(true);
    }
    setSpinning(true);
    const rolls: string[] = [];
    for (let index = 0; index < 64; index++) {
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
            }, 300);
          }
        }, i * 100);
      }
    }, 400);
  };

  const compareResult = (rolledResult: string[], pkChars: string) => {
    return rolledResult.every((value, index) => value.toLowerCase() === pkChars[index].toLowerCase());
  };

  useEffect(() => {
    let isHiiddenChars;

    if (rolled && rolledResult.length > 0 && privateKey) {
      isHiiddenChars = compareResult(rolledResult, pk);
      const rolledPk: `0x${string}` = `0x${rolledResult.join("")}`;
      const account = privateKeyToAccount(rolledPk as `0x${string}`);
      setRolledAddress(account.address);
    }

    if (isHiiddenChars) {
      setIsRolling(false);
      setSpinning(false);
      setIsHacked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolledResult]);

  return (
    <div className=" overflow-hidden h-fit">
      <div className="flex justify-center mt-2">
        <button className="btn btn-sm btn-primary " onClick={rollTheDice} disabled={isRolling || spinning || isHacked}>
          {spinning && <span className="loading loading-spinner"></span>}
          Roll
        </button>
      </div>
      <div className="h-10">
        {rolledAddress != "" && (
          <div className="flex justify-center items-center gap-2 mt-2 ">
            <span>
              <Address address={rolledAddress}></Address>
            </span>
            <span>
              <Balance address={rolledAddress}></Balance>
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-8 mt-2 opacity-100">
        {Array.from({ length: 64 }).map((_, index) => {
          let src, alt;

          if (rolled) {
            if (isUnitRolling[index]) {
              src = "/rolls-gif/Spin.gif";
              alt = "spinning";
            } else {
              src = `/rolls-jpg/${rolls[index]}.jpg`;
              alt = "rolled";
            }
          } else {
            src = "/rolls-jpg/0.jpg";
            alt = "zero roll";
          }

          return (
            <div
              key={index}
              className="w-[95%] h-[95%] overflow-hidden rounded-lg mx-auto flex justify-center items-center"
            >
              <div className="scale-125">
                <Image className="scale-150" src={src} alt={alt} width={350} height={350} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeRoll;
