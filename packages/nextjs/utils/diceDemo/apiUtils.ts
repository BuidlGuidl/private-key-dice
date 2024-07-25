import { notification } from "../scaffold-eth";
import { saveGameState } from "./game";
import serverConfig from "~~/server.config";
import { Game } from "~~/types/game/game";

const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

export const joinGame = async (invite: string, playerAddress: string) => {
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

  if (updatedGame.error) {
    notification.error(updatedGame.error);
    return;
  }
};

export const endGame = async (game: Game, token: string, address: string) => {
  await fetch(`${serverUrl}/game/${game?._id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ winner: address }),
  });
};

export const toggleMode = async (game: Game, mode: string, token: string) => {
  const response = await fetch(`${serverUrl}/admin/changemode/${game?._id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: mode }),
  });

  const responseData = await response.json();
  if (responseData.error) {
    notification.error(responseData.error);
    return;
  }
};

export const pauseResumeGame = async (game: Game, token: string) => {
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

export const kickPlayer = async (game: Game, token: string, playerAddress: string) => {
  const response = await fetch(`${serverUrl}/admin/kickplayer/${game?._id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerAddress: playerAddress }),
  });

  const responseData = await response.json();
  notification.success("Kicked " + playerAddress);
  if (responseData.error) {
    notification.error(responseData.error);
    return;
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
    await fetch(`${serverUrl}/admin/varyhiddenprivatekey/${game?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hiddenPrivateKey: hiddenPrivateKey, diceCount: diceCount }),
    });

    notification.success("Updated hidden characters");
  } catch (error) {
    notification.error((error as Error).message);
    return;
  }
};
