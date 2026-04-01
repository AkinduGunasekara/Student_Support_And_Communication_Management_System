import express from "express";
import {
  getAllComplaints,
  getComplaintById,
  getMyComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  replyToComplaint,
} from "../ticketRaising/ticket.controller.js";

import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * ----------------------------------------
 * Admin Routes
 * ----------------------------------------
 */
router.get(
  "/getall",
  authMiddleware,
  requireRole("admin"),
  getAllComplaints
);

router.put(
  "/:id/reply",
  authMiddleware,
  requireRole("admin"),
  replyToComplaint
);

/**
 * ----------------------------------------
 * User Routes
 * ----------------------------------------
 */
router.get("/my", authMiddleware, requireRole("student"), getMyComplaints);

router.get("/:id", authMiddleware, requireRole("student"), getComplaintById);

router.post("/create", authMiddleware, requireRole("student"), createComplaint);

router.put("/:id", authMiddleware, requireRole("student"), updateComplaint);

router.delete("/:id", authMiddleware, requireRole("student"), deleteComplaint);

export default router;