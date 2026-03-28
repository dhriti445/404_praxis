import { Router } from "express";
import { listReports } from "../controllers/reportController.js";

const router = Router();

router.get("/", listReports);

export default router;
