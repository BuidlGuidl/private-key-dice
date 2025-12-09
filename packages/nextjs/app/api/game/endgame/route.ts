import { NextResponse } from "next/server";
import { ably } from "~~/lib/ably";
import { verifyAuth } from "~~/lib/auth";
import db from "~~/lib/db";

export async function PATCH(req: Request) {
  try {
    const authorized = await verifyAuth();
    if (!authorized || typeof authorized !== "object" || !("address" in authorized)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();
    const winnerAddress = (authorized as { address: string }).address;

    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    // Atomic single-winner guarantee: only update if game is not yet finished.
    const result = await db.game.updateMany({
      where: {
        id,
        status: { not: "finished" },
      },
      data: {
        status: "finished",
        winner: winnerAddress,
      },
    });

    if (result.count === 0) {
      return new NextResponse("Game already finished", { status: 400 });
    }

    const updatedGame = await db.game.findUnique({
      where: { id },
    });

    if (!updatedGame) {
      return new NextResponse("Game not found after update", { status: 404 });
    }

    const channel = ably.channels.get(`gameUpdate:${game.inviteCode}`);
    await channel.publish(`gameUpdate`, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.log("[ADMIN_ENDGAME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
