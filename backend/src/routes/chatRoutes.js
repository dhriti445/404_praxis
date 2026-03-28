import { Router } from "express";
import {
	chatHandler,
	chatHistoryHandler,
	chatStatusHandler,
} from "../controllers/chatController.js";

const router = Router();

router.get("/history", chatHistoryHandler);
router.get("/status", chatStatusHandler);
router.post("/", chatHandler);

export default router;
