import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studentRegistrationId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    academicYear: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
    },

    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
    },

    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    faculty: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    course: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    answer: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["OPEN", "ANSWERED", "CLOSED"],
      default: "OPEN",
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    answeredAt: {
      type: Date,
      default: null,
    },

    studentNotified: {
      type: Boolean,
      default: false,
    },
    attachment: {
      fileName: {
        type: String,
        default: "",
      },
      fileUrl: {
        type: String,
        default: "",
      },
      fileType: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

// Indexes for better performance
messageSchema.index({ studentId: 1, createdAt: -1 });
messageSchema.index({ lecturerId: 1, createdAt: -1 });
messageSchema.index({ isPublic: 1, status: 1 });
messageSchema.index({ faculty: 1, course: 1 });
messageSchema.index({ studentRegistrationId: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;