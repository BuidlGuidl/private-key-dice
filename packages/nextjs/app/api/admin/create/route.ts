import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "~~/lib/db";
import serverConfig from "~~/server.config";

const JWT_SECRET = process.env.JWT_SECRET || serverConfig.jwt_secret;

async function generateUniqueInvite(length: number) {
  let invites = await db.invites.findFirst();

  if (!invites) {
    invites = await db.invites.create({
      data: {
        codes: [],
      },
    });
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let invite = "";
  const existingCodes = invites.codes || [];

  while (true) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invite += characters.charAt(randomIndex);
    }

    if (!existingCodes.includes(invite)) {
      existingCodes.push(invite);
      await db.invites.update({
        where: { id: invites.id },
        data: { codes: existingCodes },
      });
      return invite;
    }

    invite = "";
  }
}

export async function POST(req: Request) {
  try {
    const { diceCount, hiddenPrivateKey, mode, adminAddress } = await req.json();

    const newGame = await db.game.create({
      data: {
        adminAddress,
        status: "ongoing",
        inviteCode: await generateUniqueInvite(8),
        diceCount,
        mode,
        hiddenPrivateKey,
        players: [],
      },
    });

    let token;
    if (JWT_SECRET) token = jwt.sign({ address: adminAddress }, JWT_SECRET);

    return NextResponse.json({ token, game: newGame }, { status: 200 });
  } catch (error) {
    console.log("[ADMIN_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
