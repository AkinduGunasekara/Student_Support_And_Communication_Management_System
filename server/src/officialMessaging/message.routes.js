import express from "express";
import {
  createMessage,
  getMyMessages,
  getAllMessages,
  getMessageById,
  answerMessage,
  updateVisibility,
  getPublicMessages,
  markAsNotified,
} from "./message.controller.js";

import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public FAQ
router.get("/public", getPublicMessages);

// Student routes
router.post("/", authMiddleware, requireRole("student"), createMessage);
router.get("/my", authMiddleware, requireRole("student"), getMyMessages);
router.patch("/:id/notified", authMiddleware, requireRole("student"), markAsNotified);

// Lecturer/Admin routes
router.get("/", authMiddleware, requireRole("lecturer", "admin"), getAllMessages);
router.get("/:id", authMiddleware, requireRole("lecturer", "admin"), getMessageById);
router.patch("/:id/answer", authMiddleware, requireRole("lecturer", "admin"), answerMessage);
router.patch("/:id/visibility", authMiddleware, requireRole("lecturer", "admin"), updateVisibility);

export default router;