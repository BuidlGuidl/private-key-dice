import { notification } from "../scaffold-eth";
import serverConfig from "~~/server.config";
import { Game } from "~~/types/game/game";

const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

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

export const varyHiddenPrivatekey = async (game: Game, token: string, vary: "increase" | "decrease") => {
  let hiddenPrivateKey = game?.hiddenPrivateKey;
  const hiddenChars = game?.hiddenChars;
  const privateKey = game?.privateKey;
  let diceCount = game?.diceCount;

  const hiddCharsCopy = { ...hiddenChars };

  if (vary === "increase") {
    hiddenPrivateKey = "*".repeat(diceCount + 1) + privateKey.slice(diceCount + 1);
    hiddCharsCopy[diceCount] = privateKey[diceCount];
    diceCount++;
  } else {
    hiddenPrivateKey = "*".repeat(diceCount - 1) + privateKey.slice(diceCount - 1);
    delete hiddCharsCopy[diceCount - 1];
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
      body: JSON.stringify({ hiddenChars: hiddCharsCopy, hiddenPrivateKey: hiddenPrivateKey, diceCount: diceCount }),
    });

    notification.success("Updated hidden characters");
  } catch (error) {
    notification.error((error as Error).message);
    return;
  }
};
