import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "paused", "finished"],
      required: true,
    },
    diceCount: {
      type: Number,
      required: true,
      min: 1,
      max: 64,
    },
    mode: {
      type: String,
      enum: ["auto", "manual"],
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    type: {
      key: String,
      value: String,
    },
    prize: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
