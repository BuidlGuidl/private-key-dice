"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var invitesSchema = new mongoose_1.default.Schema({
    codes: {
        type: Array,
        default: [],
    },
});
var Invites = mongoose_1.default.model("Invites", invitesSchema, "singleton");
exports.default = Invites;
