import express from "express";
import { join } from "../controllers/Player";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.patch("/join", join);

export default router;
