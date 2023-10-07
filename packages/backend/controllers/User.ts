import Game from "../models/Game";
import { Response, Request } from "express";

export const join = async (req: Request, res: Response) => {
  try {
    const { inviteCode, userAddress } = req.body;
    const game = await Game.findOne({ inviteCode });

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ error: "Game is not ongoing." });
    }

    if (game.users.length >= game.maxPlayers) {
      return res.status(400).json({ error: "Game is full." });
    }

    if (game.users.includes(userAddress)) {
      return res.status(200).json(game); // User is already in the game
    }

    game.users.push(userAddress);
    const savedGame = await game.save();
    return res.status(200).json(savedGame);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
};


export const leave = () => {}

export const sweepPrize = () => {}
export const markSlotsAsFoundPerUser = () => {}