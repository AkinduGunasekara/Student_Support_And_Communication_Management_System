import mongoose from "mongoose";
import Counter from "../config/counter.js"

const ticketSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true },

    ticketId: { 
      type: String, 
      unique: true},

    studentId: {
      type: String,
      required: true
      // match: [/^IT\d{8}$/, "Format must be IT followed by 8 digits"],
    },
    studentEmail: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    ticketCategory: {
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
      enum: ["Pending", "Processing", "Resolved", "Completed", "Rejected"],
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
    replyMessage: {
      type: String,
      default: null,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

ticketSchema.pre("save", async function () {
  try {
    if (!this.ticketId) {
      let counter = await Counter.findOne({ name: "tickets" });

      if (!counter) {
        counter = await Counter.create({ name: "tickets", seq: 0 });
      }

      counter.seq += 1;
      await counter.save();

      this.ticketId = "T" + counter.seq.toString().padStart(3, "0");
    }
  } catch (err) {
    console.error("Error in pre-save hook:", err);
    throw err; // important
  }
});

const ticket = mongoose.model("Ticket", ticketSchema);

export default ticket;