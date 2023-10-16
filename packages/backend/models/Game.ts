import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    adminAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["lobby", "ongoing", "paused", "finished"],
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 5,
      max: 30,
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
    hiddenChars: {
      type: Object,
      required: true,
    },
    prize: {
      type: Number,
      required: true,
    },
    players: {
      type: [String],
      default: [],
      validate: {
        validator: function (value: [string]) {
          // Check if the array only contains unique strings
          const uniqueStrings = [...new Set(value)];
          return uniqueStrings.length === value.length;
        },
        message: "The players array must contain unique strings.",
      },
    },
    winner: {
      type: String,
    },
  },
  { timestamps: true },
);

const Game = mongoose.model("Game", gameSchema);

export default Game;
