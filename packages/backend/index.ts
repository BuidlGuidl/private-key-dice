import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import adminRoutes from "./routes/admin";
import playerRoutes from "./routes/player";
import gameRoutes from "./routes/game";
import http from "http";
import Ably from "ably";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/* CONFIGURATIONS */

dotenv.config();
export const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
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

const connectWithRetry = async () => {
  await ably.connection.once("connected");
  ably.channels.get(`gameUpdate`);
  console.log("connecting");
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      // app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
      server.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
    })
    .catch(error => {
      console.log(`${error} did not connect`);
      setTimeout(connectWithRetry, 3000);
    });
};

connectWithRetry();
