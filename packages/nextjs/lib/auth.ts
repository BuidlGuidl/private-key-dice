import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import serverConfig from "~~/server.config";

const JWT_SECRET = process.env.JWT_SECRET || serverConfig.jwt_secret;

export async function verifyAuth() {
  try {
    const headersList = headers();
    let token = headersList.get("authorization");

    if (!token) {
      return false;
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimStart();
    }

    const verified = jwt.verify(token, JWT_SECRET);
    return verified;
  } catch (error) {
    return false;
  }
}
