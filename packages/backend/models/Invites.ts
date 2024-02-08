import mongoose from "mongoose";

const invitesSchema = new mongoose.Schema({
  codes: {
    type: Array,
    default: [],
  },
});

const Invites = mongoose.model("Invites", invitesSchema, "singleton");

export default Invites;
