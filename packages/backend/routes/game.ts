import express from "express";
import { endGame } from "../controllers/Admin";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.patch("/:id",verifyToken, endGame);

export default router;
