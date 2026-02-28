import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    serviceId: { type: String, unique: true},
    studentId: {type: String,required: true},
    studentEmail: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    complaintCategory: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const ticket = mongoose.model("Complaint", ticketSchema);

export default ticket;