import Complaint from "../ticketRaising/ticket.model.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
    const { studentId, studentEmail, ticketCategory, description } = req.body;

    if (!studentId || !studentEmail || !ticketCategory || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = new Complaint({
      studentId,
      studentEmail,
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
 * ------------------------------------------------
 * Update Complaint (Edit Details)
 * ------------------------------------------------
 */
export const updateComplaint = async (req, res) => {
  try {
    const { studentId, studentEmail, ticketCategory, description, status } =
      req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        studentId,
        studentEmail,
        ticketCategory,
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

/**
 * --- Nodemailer Setup ---
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Admin reply to complaint and send email
 */
export async function replyToComplaint(req, res) {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        message: "Reply message is required",
      });
    }

    // Find complaint by ID
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        replyMessage,
        status: "Processing",
      },
      {new: true}
    );


    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Send email to student
    const mailOptions = {
      from: `"Complaint Support Team" <${process.env.EMAIL_USER}>`,
      to: complaint.studentEmail,
      subject: "Response to Your Complaint",
      html: `
        <h2>Complaint Response</h2>
        <p>Hello ${complaint.studentId || "Student"},</p>
        
        <p>We have reviewed your complaint regarding:</p>
        <p><b>${complaint.description}</b></p>

        <hr/>

        <p><b>Admin Reply:</b></p>
        <p>${replyMessage}</p>

        <br/>
        <p>Your complaint status is now: 
          <span style="color:green;"><b>${complaint.status}</b></span>
        </p>

        <br/>
        <p>Thank you for bringing this to our attention.</p>
        <p>Best regards,<br/>Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Reply sent successfully and complaint updated",
      complaint,
    });

  } catch (error) {
    console.error("Error replying to complaint:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}