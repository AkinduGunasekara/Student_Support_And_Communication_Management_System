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

const router = express.Router();

/**
 * ----------------------------------------
 * Get All Complaints
 * ----------------------------------------
 */
router.get("/getall", getAllComplaints);

router.put("/:id/reply", replyToComplaint)

/**
 * ----------------------------------------
 * Get Complaint By ID
 * ----------------------------------------
 */
router.get("/:id", getComplaintById);

router.get("/my", getMyComplaints);

/**
 * ----------------------------------------
 * Create New Complaint (Student Submit)
 * ----------------------------------------
 */
router.post("/create", createComplaint);

/**
 * ----------------------------------------
 * Update Full Complaint
 * ----------------------------------------
 */
router.put("/:id", updateComplaint);

/**
 * ----------------------------------------
 * Delete Complaint
 * ----------------------------------------
 */
router.delete("/:id", deleteComplaint);

export default router;