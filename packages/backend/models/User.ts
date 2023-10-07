import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    hiddenSlots: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value: [number]) {
          // Check if the array only contains numbers
          if (!Array.isArray(value) || value.some(num => typeof num !== "number")) {
            return false;
          }

          // Check if the array only contains unique numbers from 0 to 63
          const uniqueNumbers = [...new Set(value)];
          return uniqueNumbers.every(num => num >= 0 && num <= 63);
        },
        message: "The users array must contain unique numbers from 1 to 64.",
      },
    },
    prize: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
