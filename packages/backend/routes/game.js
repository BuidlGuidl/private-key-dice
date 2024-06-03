"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Admin_1 = require("../controllers/Admin");
var auth_1 = require("../middleware/auth");
var router = express_1.default.Router();
router.patch("/:id", auth_1.verifyToken, Admin_1.endGame);
exports.default = router;
