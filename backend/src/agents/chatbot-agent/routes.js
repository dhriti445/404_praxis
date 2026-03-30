import { Router } from "express";
import {
  chatHandler,
  chatHistoryHandler,
  chatStatusHandler,
} from "../../../src/controllers/chatController.js";

const router = Router();

// GET /api/chat/status - Check provider status
router.get("/status", chatStatusHandler);

// GET /api/chat/history - Retrieve latest conversation
router.get("/history", chatHistoryHandler);

// POST /api/chat - Send message and get response
router.post("/", chatHandler);

export default router;
