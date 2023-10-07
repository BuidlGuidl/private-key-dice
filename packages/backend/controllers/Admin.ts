import Game from "../models/Game";
import Invites from "../models/Invites";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

async function generateUniqueInvite(length: number) {
  let invites = await Invites.findOne();

  if (!invites) {
    const newInvites = new Invites({
      codes: [],
    });
    invites = await newInvites.save();
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let invite = "";
  const existingCodes = invites?.codes || [];

  while (true) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invite += characters.charAt(randomIndex);
    }

    if (!existingCodes.includes(invite)) {
      existingCodes.push(invite);
      await Invites.findByIdAndUpdate(invites?.id, {
        codes: existingCodes,
      });
      return invite;
    }

    invite = "";
  }
}

export const createGame = async (req: Request, res: Response) => {
  try {
    const { maxPlayers, diceCount, hiddenSlots, privateKey, prize, mode } = req.body;

    const salt = await bcrypt.genSalt();
    const privateKeyHash = await bcrypt.hash(privateKey, salt);

    const newGame = new Game({
      status: "ongoing",
      inviteCode: generateUniqueInvite(8),
      maxPlayers,
      diceCount,
      mode,
      privateKey: privateKeyHash,
      hiddenSlots, // Corrected variable name
      prize,
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const pauseGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    // Update game status to "paused"
    game.status = "paused";
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const resumeGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status === "finished") {
      return res.status(400).json({ error: "Game has ended." });
    }

    if (game.status !== "paused") {
      return res.status(400).json({ error: "Game is not paused." });
    }

    // Update game status to "ongoing"
    game.status = "ongoing";
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status === "finished") {
      return res.status(400).json({ error: "Game is already finished." });
    }

    // Update game status to "finished"
    game.status = "finished";
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const changeGameMode = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { mode } = req.body;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "paused") {
      return res.status(400).json({ error: "Game is not paused." });
    }

    // Validate the new mode (e.g., "auto" or "manual")
    if (mode !== "auto" && mode !== "manual") {
      return res.status(400).json({ error: "Invalid game mode." });
    }

    game.mode = mode;

    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const changePrize = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { newPrize } = req.body;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    // Update the prize
    game.prize = newPrize;
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const kickUser = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { userAddress } = req.body;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    const userIndex = game.users.indexOf(userAddress);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found in the game." });
    }

    // Remove the user from the game's users array
    game.users.splice(userIndex, 1);
    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const changeHiddenSlots = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { hiddenSlot } = req.body;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "paused") {
      return res.status(400).json({ error: "Game has to be paused." });
    }

    // Ensure hiddenSlot is an array
    if (!Array.isArray(hiddenSlot)) {
      return res.status(400).json({ error: "Invalid hiddenSlot format." });
    }

    // Update the hiddenSlots array and diceCount
    game.hiddenSlots = hiddenSlot;
    game.diceCount = hiddenSlot.length;

    const updatedGame = await game.save();

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
