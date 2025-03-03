"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import useGameData from "~~/hooks/useGameData";
import { useChannel } from "ably/react";
import { Game } from "@prisma/client";
import axios from "axios";
import { joinGame } from "~~/utils/diceDemo/apiUtils";
import { AdminComponent } from "./_components/AdminComponent";
import { PlayerComponent } from "./_components/PlayerComponent";
import { Price } from "~~/components/scaffold-eth/Price";

function GamePage() {
  const { id } = useParams();
  const { loadGameState, loadToken } = useGameData();
  const router = useRouter();
  const { address } = useAccount();

  const [game, setGame] = useState<Game>();
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [screenwidth, setScreenWidth] = useState(768);

  const prize = useBalance({ address: game?.adminAddress });

  useEffect(() => {
    const loadGame = async () => {
      const response = await axios.get(`/api/game/${id}`);
      const responseData = response.data;
      if (responseData.error) {
        router.push(`/`);
        notification.error(responseData.error);
        return;
      }
      if (address === responseData.game.adminAddress) {
        setIsAdmin(true);
        setGame(responseData.game);
        setToken(loadToken());
      } else if (responseData.game.players.some((player: any) => player === address)) {
        setIsPlayer(true);
        setGame(responseData.game);
        setToken(loadToken());
      } else {
        if (address) {
          const data = await joinGame(id as string, address);
          if (data?.success) {
            setGame(data.game);
            setToken(data.token);
            setIsPlayer(true);
          }
        }
      }
    };

    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, id]);

  useEffect(() => {
    if (!game && isPlayer) {
      const game = loadGameState();
      if (game && game.game) {
        const { token, game: gameState } = game;
        setGame(gameState);
        setToken(token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayer]);

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
    if (game?.players.includes(address as string)) {
      setIsPlayer(true);
    } else {
      setIsPlayer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  useChannel("gameUpdate", message => {
    if (game?.id === message.data.id) {
      setGame(message.data);
    }
  });

  if (game) {
    return (
      <div>
        <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[55%] w-11/12 mx-auto bg-secondary p-10 items-center justify-center md:text-8xl text-6xl rounded-md shadow-md">
          <Price value={Number(prize.data?.formatted)} />
        </div>
        <div className="flex mt-5 flex-col gap-4 xs:w-4/5 xl:w-[55%] w-11/12 mx-auto rounded-xl bg-secondary shadow-md overflow-hidden">
          <div className="flex md:flex-row flex-col rounded-xl overflow-hidden md:max-h-[40rem]">
            {isAdmin && <AdminComponent game={game} token={token} screenwidth={screenwidth} />}
            {isPlayer && <PlayerComponent game={game} token={token} address={address} />}
            {!isAdmin && !isPlayer && <p className="text-center text-2xl p-10">You have been kicked</p>}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mt-20 lg:text-2xl lg:px-56 px-5 text-lg h-screen">
        <p className="text-center">Loading...</p>
      </div>
    );
  }
}

export default GamePage;
