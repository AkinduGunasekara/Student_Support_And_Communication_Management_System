import express from "express";
import {
  getAllComplaints,
  getComplaintById,
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
router.get("/reply", replyToComplaint);

/**
 * ----------------------------------------
 * Get Complaint By ID
 * ----------------------------------------
 */
router.get("/:id", getComplaintById);

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