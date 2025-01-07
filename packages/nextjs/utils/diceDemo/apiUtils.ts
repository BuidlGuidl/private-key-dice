import { notification } from "../scaffold-eth";
import { saveGameState } from "./game";
import { Game } from "@prisma/client";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const joinGame = async (invite: string, playerAddress: string) => {
  try {
    const { data } = await api.patch(
      "/player/join",
      { inviteCode: invite, playerAddress },
      { headers: { Authorization: "Bearer" } },
    );

    saveGameState(JSON.stringify(data));
    notification.success(`${data.message}`);
    return { success: true, game: data.game, player: data.player, token: data.token };
  } catch (error) {
    notification.error("something went wrong");
    return;
  }
};

export const endGame = async (game: Game, token: string, address: string) => {
  try {
    await api.patch(
      "/game/endgame",
      { winner: address, id: game?.id },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    notification.success("Game ended");
  } catch (error) {
    notification.error("Something went wrong");
  }
};

export const toggleMode = async (game: Game, mode: string, token: string) => {
  try {
    await api.patch(
      "/admin/changemode",
      { mode: mode, id: game?.id },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    notification.success("Changed mode to " + mode);
  } catch (error) {
    notification.error("Something went wrong");
  }
};

export const pauseResumeGame = async (game: Game, token: string) => {
  try {
    await api.patch(
      "/admin/pauseresumegame",
      {
        status: game?.status === "ongoing" ? "paused" : "ongoing",
        id: game?.id,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    notification.error("Something went wrong");
  }
};

export const kickPlayer = async (game: Game, token: string, playerAddress: string) => {
  try {
    await api.patch(
      "/admin/kickplayer",
      { playerAddress: playerAddress, id: game?.id },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    notification.success("Kicked " + playerAddress);
  } catch (error) {
    notification.error("Something went wrong");
  }
};

export const varyHiddenPrivatekey = async (
  game: Game,
  token: string,
  vary: "increase" | "decrease",
  privateKey: string,
) => {
  let hiddenPrivateKey = game?.hiddenPrivateKey;
  let diceCount = game?.diceCount;

  if (vary === "increase") {
    hiddenPrivateKey = "*".repeat(diceCount + 1) + privateKey.slice(diceCount + 1);
    diceCount++;
  } else {
    hiddenPrivateKey = "*".repeat(diceCount - 1) + privateKey.slice(diceCount - 1);
    diceCount--;
  }

  if (diceCount < 1 || diceCount > 64) {
    notification.error("Invalid dice count.");
    return;
  }

  try {
    await api.patch(
      "/admin/varyhiddenprivatekey",
      {
        hiddenPrivateKey: hiddenPrivateKey,
        diceCount: diceCount,
        id: game?.id,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    notification.success("Updated hidden characters");
  } catch (error) {
    notification.error("Something went wrong");
  }
};
