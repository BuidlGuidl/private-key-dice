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

    const { mode, id } = await req.json();

    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (mode !== "auto" && mode !== "manual" && mode !== "brute") {
      return new NextResponse("Invalid game mode", { status: 400 });
    }

    const updatedGame = await db.game.update({
      where: { id },
      data: { mode },
    });

    const channel = ably.channels.get(`gameUpdate:${game.inviteCode}`);
    channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_CHANGEMODE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
