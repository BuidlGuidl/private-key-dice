"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
  const { id } = useParams() as { id: string };
  const { loadGameState, loadToken, updateGameState } = useGameData();
  const router = useRouter();
  const { address } = useAccount();

  const [game, setGame] = useState<Game>();
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [screenwidth, setScreenWidth] = useState(768);
  const [isSyncing, setIsSyncing] = useState(false);
  const [membershipResolved, setMembershipResolved] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);

  const prize = useBalance({ address: game?.adminAddress });

  const loadGameFromServer = useCallback(
    async (opts?: { allowJoin?: boolean }) => {
      const allowJoin = opts?.allowJoin ?? true;
      setMembershipResolved(false);
      const response = await axios.get(`/api/game/${id}`);
      const responseData = response.data;
      if (responseData.error) {
        router.push(`/`);
        notification.error(responseData.error);
        return;
      }

      const serverGame: Game = responseData.game;
      const isAdminOnServer = address === serverGame.adminAddress;
      const isPlayerOnServer = serverGame.players.some((player: any) => player === address);

      setGame(serverGame);
      setIsAdmin(isAdminOnServer);
      setIsPlayer(isPlayerOnServer);

      // Persist refreshed game into local storage if we have a saved token.
      const stored = loadGameState();
      if (stored && stored.token) {
        updateGameState(JSON.stringify(serverGame));
      }

      if (isAdminOnServer) {
        const t = loadToken();
        if (t) setToken(t);
        setMembershipResolved(true);
        return;
      }

      if (isPlayerOnServer) {
        const existingToken = loadToken();
        if (existingToken) {
          setToken(existingToken);
          setMembershipResolved(true);
          return;
        }
        // Re-issue token for returning player without duplicating them in players[].
        if (address) {
          const data = await joinGame(id as string, address);
          if (data?.token) {
            setToken(data.token);
          }
        }
        setMembershipResolved(true);
        return;
      }

      // New player path
      if (allowJoin && address) {
        const data = await joinGame(id as string, address);
        if (data?.success) {
          setGame(data.game);
          setToken(data.token);
          setIsPlayer(true);
        }
      }
      setMembershipResolved(true);
    },
    // We intentionally keep dependencies small to avoid infinite re-fetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, id, router],
  );

  useEffect(() => {
    loadGameFromServer();
  }, [loadGameFromServer]);

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
    if (!game || !address) {
      setIsPlayer(false);
      setWasKicked(false);
      return;
    }

    const isPlayerNow = game.players.includes(address as string);
    const kickedList = (game as any).kickedPlayers as string[] | undefined;
    const isKickedNow = !!kickedList?.includes(address as string) && !isPlayerNow;

    setIsPlayer(isPlayerNow);
    setWasKicked(isKickedNow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, address]);

  useChannel(`gameUpdate:${id}`, message => {
    if (game?.id === message.data.id) {
      setGame(message.data);
    }
  });

  if (game) {
    return (
      <main className="min-h-[calc(100vh-4rem)] px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Prize / header row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.24em] text-base-content/60">
                Game invite&nbsp;
                <span className="text-accent font-semibold">{game.inviteCode}</span>
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
                <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                  Private Key Heist
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs md:text-sm text-base-content/60">
                <p className="m-0">
                  Mode: <span className="font-semibold uppercase">{game.mode}</span> · Players:{" "}
                  <span className="font-semibold">{game.players.length}</span>
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSyncing(true);
                      await loadGameFromServer({ allowJoin: false });
                      notification.success("Game state refreshed");
                    } catch {
                      notification.error("Failed to refresh game state");
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="btn btn-ghost btn-xs tooltip tooltip-bottom border border-base-300/60 hover:border-primary/60"
                  data-tip={isSyncing ? "Refreshing..." : "Re-sync game state"}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 md:mt-0">
              <div className="relative rounded-3xl bg-gradient-to-r from-primary/40 via-secondary/70 to-accent/50 border border-primary/40 shadow-glow-primary px-6 py-4 md:px-8 md:py-5 text-center">
                <div className="absolute -top-2 right-6">
                  <span className="inline-flex items-center rounded-full bg-base-100/80 px-3 py-0.5 text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em] text-base-content/70">
                    Prize pool
                  </span>
                </div>
                <div className="mt-2 md:mt-3 text-3xl md:text-5xl font-extrabold text-emerald-300 drop-shadow-[0_0_18px_rgba(15,23,42,0.65)]">
                  <Price value={Number(prize.data?.formatted) || 0} />
                </div>
              </div>
            </div>
          </div>

          {/* Game arena */}
          <div className="rounded-3xl bg-base-100/80 border border-secondary/40 shadow-[0_0_40px_rgba(15,23,42,0.7)] overflow-hidden">
            <div className="flex flex-col md:flex-row w-full md:max-h-[40rem]">
              {isAdmin && (
                <div className="md:border-r md:border-base-300/70 bg-secondary/50">
                  <AdminComponent game={game} token={token} screenwidth={screenwidth} />
                </div>
              )}
              {isPlayer && (
                <div className="flex-1 bg-gradient-to-b from-base-100/80 via-base-200/70 to-base-300/80">
                  <PlayerComponent game={game} token={token} address={address} />
                </div>
              )}
              {!isAdmin && !isPlayer && wasKicked && membershipResolved && (
                <div className="flex flex-1 items-center justify-center bg-base-200/80 px-6 py-16 text-center">
                  <p className="text-xl md:text-2xl font-semibold text-base-content/80">
                    You have been kicked from this game.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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
