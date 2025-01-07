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

    const { id, status } = await req.json();
    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    const updatedGame = await db.game.update({
      where: { id },
      data: { status: status },
    });

    const channel = ably.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_PAUSE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
