import Message from "./message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Student: create a new question
export const createMessage = async (req, res) => {
  try {
    const {
      lecturerId,
      faculty,
      course,
      subject,
      question,
      studentRegistrationId,
      studentEmail,
      academicYear,
      semester,
    } = req.body;

    if (
      !subject ||
      !question ||
      !studentRegistrationId ||
      !(studentEmail || req.user.email) ||
      !academicYear ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "Subject, question, studentRegistrationId, studentEmail, academicYear and semester are required",
      });
    }

    let assignedLecturer = null;

    if (lecturerId) {
      if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
        return res.status(400).json({ message: "Invalid lecturer ID" });
      }

      const lecturer = await User.findById(lecturerId);

      if (!lecturer) {
        return res.status(404).json({ message: "Lecturer not found" });
      }

      if (lecturer.role !== "lecturer") {
        return res.status(400).json({ message: "Selected user is not a lecturer" });
      }

      if (!lecturer.isActive) {
        return res.status(400).json({ message: "Selected lecturer is inactive" });
      }

      assignedLecturer = lecturer._id;
    }

    let attachment = {
      fileName: "",
      fileData: "",
      fileType: "",
    };

    if (req.file) {
      // Convert file buffer to base64
      const base64Data = req.file.buffer.toString("base64");
      attachment = {
        fileName: req.file.originalname,
        fileData: base64Data,
        fileType: req.file.mimetype,
      };
    }

    const message = await Message.create({
      studentId: req.user._id,
      studentRegistrationId,
      studentEmail: studentEmail || req.user.email || "",
      academicYear: academicYear || req.user.year || null,
      semester,
      lecturerId: assignedLecturer,
      faculty: faculty || "",
      course: course || "",
      subject,
      question,
      attachment,
      studentNotified: false,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Student: get only own questions
export const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ studentId: req.user._id })
      .populate("lecturerId", "name email role faculty course")
      .populate("answeredBy", "name email role faculty course")
      .sort({ createdAt: -1 });

    return res.json(messages);
  } catch (error) {
    console.error("Get my messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lecturer/Admin: get messages
export const getAllMessages = async (req, res) => {
  try {
    let messages;

    if (req.user.role === "admin") {
      messages = await Message.find()
        .populate("studentId", "name email role year faculty course")
        .populate("lecturerId", "name email role faculty course")
        .populate("answeredBy", "name email role faculty course")
        .sort({ createdAt: -1 });
    } else {
      messages = await Message.find({
        $or: [{ lecturerId: req.user._id }, { lecturerId: null }],
      })
        .populate("studentId", "name email role year faculty course")
        .populate("lecturerId", "name email role faculty course")
        .populate("answeredBy", "name email role faculty course")
        .sort({ createdAt: -1 });
    }

    return res.json(messages);
  } catch (error) {
    console.error("Get all messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lecturer/Admin: get single message by id
export const getMessageById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(req.params.id)
      .populate("studentId", "name email role year faculty course")
      .populate("lecturerId", "name email role faculty course")
      .populate("answeredBy", "name email role faculty course");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      req.user.role === "lecturer" &&
      message.lecturerId &&
      String(message.lecturerId._id || message.lecturerId) !==
        String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    return res.json(message);
  } catch (error) {
    console.error("Get message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lecturer/Admin: answer a question
export const answerMessage = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ message: "Answer is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      req.user.role === "lecturer" &&
      message.lecturerId &&
      String(message.lecturerId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Forbidden: You can answer only messages assigned to you",
      });
    }

    if (!message.lecturerId && req.user.role === "lecturer") {
      message.lecturerId = req.user._id;
    }

    message.answer = answer;
    message.status = "ANSWERED";
    message.answeredBy = req.user._id;
    message.answeredAt = new Date();
    message.studentNotified = false;

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Answer message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lecturer/Admin: make question public or private
export const updateVisibility = async (req, res) => {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res
        .status(400)
        .json({ message: "isPublic must be true or false" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const existingMessage = await Message.findById(req.params.id);

    if (!existingMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      req.user.role === "lecturer" &&
      existingMessage.lecturerId &&
      String(existingMessage.lecturerId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You can update visibility only for your own messages",
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { isPublic } },
      { returnDocument: "after" }
    );

    return res.json(updatedMessage);
  } catch (error) {
    console.error("Update visibility error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Student: mark notification as seen
export const markAsNotified = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: req.params.id,
        studentId: req.user._id,
      },
      {
        $set: { studentNotified: true },
      },
      {
        returnDocument: "after",
      }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.json({
      message: "Notification marked as seen",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Mark notified error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Public FAQ with search + filter
export const getPublicMessages = async (req, res) => {
  try {
    const { search, faculty, course } = req.query;

    const filter = {
      isPublic: true,
      status: "ANSWERED",
    };

    if (faculty) {
      filter.faculty = faculty;
    }

    if (course) {
      filter.course = course;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const messages = await Message.find(filter)
      .populate("answeredBy", "name email role faculty course")
      .sort({ updatedAt: -1 });

    return res.json(messages);
  } catch (error) {
    console.error("Get public messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Student: can delete only own message and only before answer
    if (req.user.role === "student") {
      if (String(message.studentId) !== String(req.user._id)) {
        return res.status(403).json({
          message: "Forbidden: You can delete only your own messages",
        });
      }

      if (message.status === "ANSWERED") {
        return res.status(400).json({
          message: "Cannot delete answered messages",
        });
      }
    }

    // Lecturer: can delete only messages assigned to them
    if (req.user.role === "lecturer") {
      if (
        message.lecturerId &&
        String(message.lecturerId) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Forbidden: You can delete only messages assigned to you",
        });
      }
    }

    await message.deleteOne();

    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};