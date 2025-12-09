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

    const { hiddenPrivateKey, diceCount, id } = await req.json();

    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (diceCount < 1 || diceCount > 64) {
      return new NextResponse("Invalid dice count", { status: 400 });
    }

    const updatedGame = await db.game.update({
      where: { id },
      data: {
        hiddenPrivateKey,
        diceCount,
      },
    });

    const channel = ably.channels.get(`gameUpdate:${game.inviteCode}`);
    await channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_VARYHIDDENPRIVATEKEY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
