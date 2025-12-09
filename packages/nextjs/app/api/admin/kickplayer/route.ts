import { NextResponse } from "next/server";
import { ably } from "~~/lib/ably";
import { verifyAuth } from "~~/lib/auth";
import db from "~~/lib/db";

export async function PATCH(req: Request) {
  try {
    const authorized = await verifyAuth();
    if (!authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { playerAddress, id } = await req.json();

    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 400 });
    }

    if (game.status !== "ongoing") {
      return new NextResponse("Game is not ongoing", { status: 400 });
    }

    if (!game.players.includes(playerAddress)) {
      return new NextResponse("Player not found", { status: 404 });
    }

    const updatedPlayers = game.players.filter((p: string) => p !== playerAddress);
    const updatedGame = await db.game.update({
      where: { id },
      data: {
        players: updatedPlayers,
        kickedPlayers: {
          push: playerAddress,
        },
      },
    });

    const channel = ably.channels.get(`gameUpdate:${game.inviteCode}`);
    await channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_KICKPLAYER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
