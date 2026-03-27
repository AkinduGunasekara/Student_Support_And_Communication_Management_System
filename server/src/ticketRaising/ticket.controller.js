import Ticket from "../ticketRaising/ticket.model.js";
import User from "../models/user.model.js"; // import your User model
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * ------------------------------------------------
 * Get All Tickets (Admin / Lecturer Dashboard)
 * ------------------------------------------------
 */
export const getAllComplaints = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "name studentId email faculty year") // populate user info
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error in getAllTickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Get Ticket By ID
 * ------------------------------------------------
 */
export const getComplaintById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("userId", "name studentId email faculty year");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error in getTicketById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get logged-in user's tickets
 */
export const getMyComplaints = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate("userId", "name studentId email faculty year")
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error in getMyTickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Create New Ticket (Student Submit)
 * ------------------------------------------------
 */
export const createComplaint = async (req, res) => {
  try {
    const { userId, studentId, studentEmail, faculty, accodamicYear, ticketCategory, description } = req.body;

    if (!studentId || !studentEmail || !faculty || !accodamicYear || !ticketCategory || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const regexId = /^IT\d{8}$/;
    if (!regexId.test(studentId)) {
      return res.status(400).json({
        message: "Invalid Student ID. Format must be IT followed by 8 digits (e.g., IT12345678)",
      });
    }

    // Find the User by studentId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create ticket with user reference and copy user info
    const ticket = new Ticket({
      userId: user._id,
      studentId,
      studentEmail,
      faculty,
      accodamicYear,
      ticketCategory,
      description,
    });

    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);

  } catch (error) {
    console.error("Error in createTicket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Update Ticket (Edit Details)
 * ------------------------------------------------
 */
export const updateComplaint = async (req, res) => {
  try {
    const { userId, studentId, studentEmail, faculty, accodamicYear, ticketCategory, description, status } = req.body;

    if (!studentId || !studentEmail || !faculty || !accodamicYear || !ticketCategory || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const regexId = /^IT\d{8}$/;
    if (!regexId.test(studentId)) {
      return res.status(400).json({
        message: "Invalid Student ID. Format must be IT followed by 8 digits",
      });
    }

    // Find User to update info
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        userId: user._id,
        studentId: user.studentId,
        studentEmail: user.email,
        faculty: user.faculty,
        accodamicYear: user.year,
        ticketCategory,
        description,
        status,
      },
      { returnDocument: "after" }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(updatedTicket);

  } catch (error) {
    console.error("Error in updateTicket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ------------------------------------------------
 * Delete Ticket
 * ------------------------------------------------
 */
export const deleteComplaint = async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTicket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * --- Nodemailer Setup ---
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Admin reply to ticket and send email
 */
export const replyToComplaint = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ message: "Reply message is required" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { replyMessage, status: "Resolved" },
      { returnDocument: "after" }
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Send email to student
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: ticket.studentEmail,
      subject: "Response to Your Ticket",
      html: `
        <h2>Ticket Response</h2>
        <p>Hello ${ticket.studentId},</p>
        <p>We have reviewed your ticket regarding:</p>
        <p><b>${ticket.description}</b></p>
        <hr/>
        <p><b>Admin Reply:</b></p>
        <p>${replyMessage}</p>
        <br/>
        <p>Your ticket status is now: 
          <span style="color:green;"><b>${ticket.status}</b></span>
        </p>
        <br/>
        <p>Thank you for reaching out.</p>
        <p>Best regards,<br/>Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Reply sent successfully and ticket updated",
      ticket,
    });

  } catch (error) {
    console.error("Error replying to ticket:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// import Complaint from "../ticketRaising/ticket.model.js";
// import dotenv from "dotenv";
// import nodemailer from "nodemailer";

// dotenv.config();

// /**
//  * ------------------------------------------------
//  * Get All Complaints (Admin / Lecturer Dashboard)
//  * ------------------------------------------------
//  */
// export const getAllComplaints = async (req, res) => {
//   try {
//     const complaints = await Complaint.find().sort({ createdAt: -1 });
//     res.status(200).json(complaints);
//   } catch (error) {
//     console.error("Error in getAllComplaints:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// /**
//  * ------------------------------------------------
//  * Get Complaint By ID
//  * ------------------------------------------------
//  */
// export const getComplaintById = async (req, res) => {
//   try {
//     const complaint = await Complaint.findById(req.params.id);

//     if (!complaint) {
//       return res.status(404).json({ message: "Complaint not found" });
//     }

//     res.status(200).json(complaint);
//   } catch (error) {
//     console.error("Error in getComplaintById:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// /**
//  * Get logged-in user's services
//  */
// export const getMyComplaints = async (req, res) => {
//   try {
//     const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(complaints);
//   } catch (error) {
//     console.error("Error in getMyTickets:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// /**
//  * ------------------------------------------------
//  * Create New Complaint (Student Submit)
//  * ------------------------------------------------
//  */
// export const createComplaint = async (req, res) => {
//   try {
//     const { studentId, studentEmail, faculty, accodamicYear, ticketCategory, description } = req.body;

//     const regex1 = /^IT\d{8}$/;
//     const regex2 = /.+@.+\..+/

//     if (!regex1.test(studentId)) {
//       return res.status(400).json({
//         message: "Invalid Student ID. Format must be IT followed by 8 digits (e.g., IT12345678)"
//       });
//     }

//     if (!regex2.test(studentEmail)) {
//       return res.status(400).json({
//         message: "Invalid Student Email. Format must be student@domain.lk "
//       });
//     }

//     if (!studentId || !studentEmail || !faculty || !accodamicYear || !ticketCategory || !description) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const complaint = new Complaint({
//       studentId,
//       studentEmail,
//       faculty,
//       accodamicYear,
//       ticketCategory,
//       description,
//     });

//     const savedComplaint = await complaint.save();

//     res.status(201).json(savedComplaint);
//   } catch (error) {
//     console.error("Error in createComplaint:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// /**
//  * ------------------------------------------------
//  * Update Complaint (Edit Details)
//  * ------------------------------------------------
//  */
// export const updateComplaint = async (req, res) => {
//   try {
//     const { studentId, studentEmail, faculty, accodamicYear, ticketCategory, description, status } =
//       req.body;

//     const regex1 = /^IT\d{8}$/;
//     const regex2 = /.+@.+\..+/

//     if (!regex1.test(studentId)) {
//       return res.status(400).json({
//         message: "Invalid Student ID. Format must be IT followed by 8 digits (e.g., IT12345678)"
//       });
//     }

//     if (!regex2.test(studentEmail)) {
//       return res.status(400).json({
//         message: "Invalid Student Email. Format must be student@domain.lk "
//       });
//     }

//     const updatedComplaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       {
//         studentId,
//         studentEmail,
//         faculty,
//         accodamicYear,
//         ticketCategory,
//         description,
//       },
//       { new: true }
//     );

//     if (!updatedComplaint) {
//       return res.status(404).json({ message: "Complaint not found" });
//     }

//     res.status(200).json(updatedComplaint);
//   } catch (error) {
//     console.error("Error in updateComplaint:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// /**
//  * ------------------------------------------------
//  * Delete Complaint
//  * ------------------------------------------------
//  */
// export const deleteComplaint = async (req, res) => {
//   try {
//     const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);

//     if (!deletedComplaint) {
//       return res.status(404).json({ message: "Complaint not found" });
//     }

//     res.status(200).json({ message: "Complaint deleted successfully" });
//   } catch (error) {
//     console.error("Error in deleteComplaint:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// /**
//  * --- Nodemailer Setup ---
//  */
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,           // SSL port
//   secure: true,        // use SSL
//   auth: {
//     user: process.env.EMAIL_USER, // your Gmail
//     pass: process.env.EMAIL_PASS, // Gmail App Password
//   },
//   tls: {
//     rejectUnauthorized: false, // ignore self-signed certs (dev only)
//   },
// });

// /**
//  * Admin reply to complaint and send email
//  */
// export const replyToComplaint = async (req, res) => {
//   try {
//     const { replyMessage } = req.body;

//     if (!replyMessage) {
//       return res.status(400).json({
//         message: "Reply message is required",
//       });
//     }

//     // Find complaint by ID and update
//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       {
//         replyMessage,
//         status: "Resolved",
//       },
//       { returnDocument: "after" } // replaces deprecated `new: true`
//     );

//     if (!complaint) {
//       return res.status(404).json({
//         message: "Complaint not found",
//       });
//     }

//     // Send email to student
//     const mailOptions = {
//       from: `"Complaint Support Team" <${process.env.EMAIL_USER}>`,
//       to: complaint.studentEmail,
//       subject: "Response to Your Complaint",
//       html: `
//         <h2>Complaint Response</h2>
//         <p>Hello ${complaint.studentId || "Student"},</p>
        
//         <p>We have reviewed your complaint regarding:</p>
//         <p><b>${complaint.description}</b></p>

//         <hr/>

//         <p><b>Admin Reply:</b></p>
//         <p>${replyMessage}</p>

//         <br/>
//         <p>Your complaint status is now: 
//           <span style="color:green;"><b>${complaint.status}</b></span>
//         </p>

//         <br/>
//         <p>Thank you for bringing this to our attention.</p>
//         <p>Best regards,<br/>Support Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       message: "Reply sent successfully and complaint updated",
//       complaint,
//     });

//   } catch (error) {
//     console.error("Error replying to complaint:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };