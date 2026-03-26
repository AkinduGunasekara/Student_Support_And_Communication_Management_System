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
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();

/**
 * ----------------------------------------
 * Get All Complaints Admin side
 * ----------------------------------------
 */
router.get("/getall", getAllComplaints);

router.put("/:id/reply", replyToComplaint)

/**
 * ----------------------------------------
 * Get logging user
 * ----------------------------------------
 */
router.get("/:id", authMiddleware, getComplaintById);

router.get("/my", authMiddleware, getMyComplaints);

/**
 * ----------------------------------------
 * Create New Complaint (Student Submit)
 * ----------------------------------------
 */
router.post("/create", authMiddleware, createComplaint);

/**
 * ----------------------------------------
 * Update Full Complaint
 * ----------------------------------------
 */
router.put("/:id", authMiddleware, updateComplaint);

/**
 * ----------------------------------------
 * Delete Complaint
 * ----------------------------------------
 */
router.delete("/:id", authMiddleware, deleteComplaint);

export default router;