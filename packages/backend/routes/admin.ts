import express from "express";
import { createGame } from "../controllers/Admin";

const router = express.Router();

router.post("/create", createGame);

export default router;
