import express from "express";
import {
	createFeedback,
	getAllFeedback,
	getMyFeedback,
} from "./feedback.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("student"), createFeedback);
router.get("/my", authMiddleware, requireRole("student"), getMyFeedback);
router.get("/", authMiddleware, requireRole("lecturer", "admin"), getAllFeedback);

export default router;
