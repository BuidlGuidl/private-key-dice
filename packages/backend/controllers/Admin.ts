import Game from "../models/Game";
import Invites from "../models/Invites";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ably } from "..";

const JWT_SECRET = process.env.JWT_SECRET || "superhardstring";

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
    const { diceCount, privateKey, hiddenPrivateKey, mode, adminAddress } = req.body;

    const salt = await bcrypt.genSalt();
    // const privateKeyHash = await bcrypt.hash(privateKey, salt);

    const newGame = new Game({
      adminAddress,
      status: "ongoing",
      inviteCode: await generateUniqueInvite(8),
      diceCount,
      mode,
      privateKey,
      hiddenPrivateKey,
    });

    let token;

    if (JWT_SECRET) token = jwt.sign({ address: adminAddress }, JWT_SECRET);

    const savedGame = await newGame.save();
    res.status(201).json({ token, game: savedGame });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const restartWithNewPk = async (req: Request, res: Response) => {
  try {
    const { diceCount, privateKey, hiddenPrivateKey, adminAddress } = req.body;
    const { id } = req.params;
    const game = await Game.findById(id);

    if (game?.status !== "finished") {
      return res.status(400).json({ error: "Game is not finished." });
    }

    game.diceCount = diceCount;
    game.privateKey = privateKey;
    game.hiddenPrivateKey = hiddenPrivateKey;
    game.mode = "manual";
    game.adminAddress = adminAddress;
    game.winner = undefined;
    game.status = "ongoing";

    const updatedGame = await game.save();
    console.log(updatedGame);

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);
    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const pauseGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    // Update game status to "paused"
    game.status = "paused";
    const updatedGame = await game.save();

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);
    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const resumeGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

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

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);
    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status === "finished") {
      return res.status(400).json({ error: "Game is already finished." });
    }

    // Update game status to "finished"
    game.status = "finished";
    if (req.body) {
      const { winner } = req.body;
      game.winner = winner;
    }
    const updatedGame = await game.save();

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const changeGameMode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    // if (game.status !== "paused") {
    //   return res.status(400).json({ error: "Game is not paused." });
    // }

    if (mode !== "auto" && mode !== "manual" && mode !== "brute") {
      return res.status(400).json({ error: "Invalid game mode." });
    }

    game.mode = mode;

    const updatedGame = await game.save();

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const kickPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerAddress } = req.body;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    const playerIndex = game.players.indexOf(playerAddress);
    if (playerIndex === -1) {
      return res.status(404).json({ error: "Player not found in the game." });
    }

    game.players.splice(playerIndex, 1);
    const updatedGame = await game.save();
    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const varyHiddenPrivatekey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hiddenPrivateKey, diceCount } = req.body;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (diceCount < 1 || diceCount > 64) {
      return res.status(400).json({ error: "Invalid dice count." });
    }

    game.hiddenPrivateKey = hiddenPrivateKey;
    game.diceCount = diceCount;
    const updatedGame = await game.save();
    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);

    res.status(200).json(updatedGame);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
