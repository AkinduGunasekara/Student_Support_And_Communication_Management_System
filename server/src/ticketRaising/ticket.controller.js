import Complaint from "../ticketRaising/ticket.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * ----------------------------------------
 * Get All Complaints (Admin)
 * ----------------------------------------
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ----------------------------------------
 * Get Complaint By ID
 * ----------------------------------------
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email");

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
 * ----------------------------------------
 * Get Logged-in User Complaints
 * ----------------------------------------
 */
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error in getMyComplaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  /**
 * ----------------------------------------
 * Create Complaint (User-wise)
 * ----------------------------------------
 */

  export const createComplaint = async (req, res) => {
  try {
    const {
      studentId,
      studentEmail,
      faculty,
      accadomicYear,
      ticketCategory,
      description,
    } = req.body;

    const regex1 = /^IT\d{8}$/;
    const regex2 = /.+@.+\..+/;

    if (!regex1.test(studentId)) {
      return res.status(400).json({
        message:
          "Invalid Student ID. Format must be IT followed by 8 digits",
      });
    }

    if (!regex2.test(studentEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (
      !studentId ||
      !studentEmail ||
      !faculty ||
      !accadomicYear ||
      !ticketCategory ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = new Complaint({
      userId: req.user._id, // 🔥 CONNECT USER
      studentId,
      studentEmail,
      accadomicYear,
      faculty,
      ticketCategory,
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
 * ----------------------------------------
 * Update Complaint (Only Owner)
 * ----------------------------------------
 */

export const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🔒 Only owner can edit
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error("Error in updateComplaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ----------------------------------------
 * Delete Complaint (Only Owner)
 * ----------------------------------------
 */

export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🔒 Only owner can delete
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await complaint.deleteOne();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComplaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ----------------------------------------
 * Nodemailer Setup
 * ----------------------------------------
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * ----------------------------------------
 * Admin Reply + Email
 * ----------------------------------------
 */
export const replyToComplaint = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        message: "Reply message is required",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        replyMessage,
        status: "Resolved",
      },
      { returnDocument: 'after' }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: complaint.studentEmail,
      subject: "Complaint Response",
      html: `
        <h2>Complaint Response</h2>
        <p>Hello ${complaint.studentId}</p>
        <p><b>Your Issue:</b> ${complaint.description}</p>
        <hr/>
        <p><b>Reply:</b> ${replyMessage}</p>
        <p>Status: <b>${complaint.status}</b></p>
      `,
    });

    res.status(200).json({
      message: "Reply sent & updated",
      complaint,
    });
  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
