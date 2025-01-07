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

    const { id, winner } = await req.json();
    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.status === "finished") {
      return new NextResponse("Game already finished", { status: 400 });
    }

    const updatedGame = await db.game.update({
      where: { id },
      data: { status: "finished", winner },
    });

    const channel = ably.channels.get(`gameUpdate`);
    await channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_ENDGAME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
