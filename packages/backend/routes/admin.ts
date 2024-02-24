import express from "express";
import { createGame, changeGameMode, pauseGame, resumeGame, kickPlayer, restartWithNewPk } from "../controllers/Admin";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/create", createGame);
router.patch("/changemode/:id", verifyToken, changeGameMode);
router.patch("/pause/:id", verifyToken, pauseGame);
router.patch("/resume/:id", verifyToken, resumeGame);
router.patch("/kickplayer/:id", verifyToken, kickPlayer);
router.patch("/restartwithnewpk/:id", verifyToken, restartWithNewPk);

export default router;
