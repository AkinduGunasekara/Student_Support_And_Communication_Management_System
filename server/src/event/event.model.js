import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // PUBLIC FIELDS
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["academic", "club", "sports", "other"],
      default: "other",
    },
    image: {
      type: String, // poster/banner URL
    },

    audience: {
      type: String,
      default: "all", // who this event is for
    },

    // INTERNAL FIELDS
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvalLetter: {
      type: String, // file URL
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;