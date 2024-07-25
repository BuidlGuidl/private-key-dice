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
    diceCount: {
      type: Number,
      required: true,
      min: 1,
      max: 64,
    },
    mode: {
      type: String,
      enum: ["auto", "manual", "brute"],
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    hiddenPrivateKey: {
      type: String,
      required: true,
    },
    players: {
      type: [String],
      default: [],
      validate: {
        validator: function (value: [string]) {
          const uniqueStrings: string[] = [];
          value.forEach(item => {
            if (!uniqueStrings.includes(item)) {
              uniqueStrings.push(item);
            }
          });
          return uniqueStrings.length === value.length;
        },
        message: "The players array must contain unique addresses.",
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
