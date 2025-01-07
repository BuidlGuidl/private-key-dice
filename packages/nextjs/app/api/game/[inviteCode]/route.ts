import { NextResponse } from "next/server";
import db from "~~/lib/db";

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const inviteCode = url.pathname.split("/").pop();

    const game = await db.game.findFirst({ where: { inviteCode } });
    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    console.log("[GAME_FETCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
