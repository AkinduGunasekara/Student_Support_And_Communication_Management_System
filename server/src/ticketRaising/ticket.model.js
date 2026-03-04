import mongoose from "mongoose";
import Counter from "../config/counter.js"

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true},
    studentId: {type: String,required: true},
    studentEmail: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
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
    replyMessage: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Rejected"],
      default: "Pending",
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

      this.ticketId = "t" + counter.seq.toString().padStart(3, "0");
    }
  } catch (err) {
    console.error("Error in pre-save hook:", err);
    throw err; // important
  }
});

const ticket = mongoose.model("Ticket", ticketSchema);

export default ticket;