import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import adminRoutes from "./routes/admin";
import playerRoutes from "./routes/player";
import gameRoutes from "./routes/game";
import http from "http";
import Ably from "ably";
import path = require("path");

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envPath });

/* CONFIGURATIONS */

export const app = express();
app.use(express.json());
app.use(cors());

/**Ably Setup */

export const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

const server = http.createServer(app);
/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URL || "";

app.use("/admin", adminRoutes);
app.use("/player", playerRoutes);
app.use("/game", gameRoutes);

app.get("/about", (req, res) => {
  res.send("Dice Demo Backend 🎉 ");
});

const connectWithRetry = async () => {
  await ably.connection.once("connected");
  ably.channels.get(`gameUpdate`);
  console.log("connecting");
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      app.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
      // server.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
    })
    .catch(error => {
      console.log(`${error} did not connect`);
      setTimeout(connectWithRetry, 3000);
    });
};

connectWithRetry();
