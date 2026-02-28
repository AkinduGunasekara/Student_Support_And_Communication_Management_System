import express from "express";
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from "../ticketRaising/ticket.controller.js";

const router = express.Router();

/**
 * ----------------------------------------
 * Get All Complaints
 * ----------------------------------------
 */
router.get("/", getAllComplaints);

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
router.post("/", createComplaint);

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