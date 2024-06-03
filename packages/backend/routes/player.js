"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Player_1 = require("../controllers/Player");
var router = express_1.default.Router();
router.patch("/join", Player_1.join);
exports.default = router;
