import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ably } from "~~/lib/ably";
import db from "~~/lib/db";
import serverConfig from "~~/server.config";

const JWT_SECRET = process.env.JWT_SECRET || serverConfig.jwt_secret;

export async function PATCH(req: Request) {
  try {
    const { inviteCode, playerAddress } = await req.json();

    const game = await db.game.findFirst({
      where: {
        inviteCode,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.status !== "ongoing") {
      return new NextResponse("Game is not ongoing", { status: 400 });
    }

    if (game.players.includes(playerAddress)) {
      let token;
      if (JWT_SECRET) {
        token = jwt.sign({ address: playerAddress }, JWT_SECRET);
      }
      return NextResponse.json({ token, game, message: "Already joined" });
    }

    let token;
    if (JWT_SECRET) {
      token = jwt.sign({ address: playerAddress }, JWT_SECRET);
    }

    const updatedGame = await db.game.update({
      where: {
        id: game.id,
      },
      data: {
        players: {
          push: playerAddress,
        },
      },
    });

    const channel = ably.channels.get(`gameUpdate`);
    await channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json({ token, game: updatedGame, message: "Joined game" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
