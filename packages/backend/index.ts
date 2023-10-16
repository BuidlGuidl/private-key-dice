import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import adminRoutes from "./routes/admin";
import playerRoutes from "./routes/player";
import gameRoutes from "./routes/game";

/* CONFIGURATIONS */

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URL || "";

app.use("/admin", adminRoutes);
app.use("/player", playerRoutes);
app.use("/game", gameRoutes);

const connectWithRetry = () => {
  console.log("connecting");
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    })
    .catch(error => {
      console.log(`${error} did not connect`);
      setTimeout(connectWithRetry, 3000);
    });
};

connectWithRetry();
