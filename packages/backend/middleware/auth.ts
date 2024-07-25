import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import backendConfig from "../backend.config";

const JWT_SECRET = process.env.JWT_SECRET || backendConfig.jwt_secret;

export const verifyToken = async (req: Request, res: Response, next: () => void) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimStart();
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
