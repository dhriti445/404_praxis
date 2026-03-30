import { Router } from "express";
import { getPlaybookById, listPlaybooks } from "../controllers/playbookController.js";

const router = Router();

router.get("/", listPlaybooks);
router.get("/:id", getPlaybookById);

export default router;
