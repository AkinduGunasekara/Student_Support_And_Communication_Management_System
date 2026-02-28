import Complaint from "../ticketRaising/ticket.model.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * ------------------------------------------------
 * Get All Complaints (Admin / Lecturer Dashboard)
 * ------------------------------------------------
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Get Complaint By ID
 * ------------------------------------------------
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error in getComplaintById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Create New Complaint (Student Submit)
 * ------------------------------------------------
 */
export const createComplaint = async (req, res) => {
  try {
    const { studentId, studentEmail, complaintCategory, description } = req.body;

    if (!studentId || !studentEmail || !complaintCategory || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = new Complaint({
      studentId,
      studentEmail,
      complaintCategory,
      description,
    });

    const savedComplaint = await complaint.save();

    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error("Error in createComplaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Update Complaint (Edit Details)
 * ------------------------------------------------
 */
export const updateComplaint = async (req, res) => {
  try {
    const { studentId, studentEmail, complaintCategory, description, status } =
      req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        studentId,
        studentEmail,
        complaintCategory,
        description,
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error("Error in updateComplaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Delete Complaint
 * ------------------------------------------------
 */
export const deleteComplaint = async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!deletedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComplaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};