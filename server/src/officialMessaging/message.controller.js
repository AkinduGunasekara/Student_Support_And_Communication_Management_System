import Message from "./message.model.js";
import User from "../models/user.model.js";

// Student: create a new question
export const createMessage = async (req, res) => {
  try {
    const { lecturerId, faculty, course, subject, question } = req.body;

    if (!subject || !question) {
      return res
        .status(400)
        .json({ message: "Subject and question are required" });
    }

    let assignedLecturer = null;

    if (lecturerId) {
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

    const message = await Message.create({
      studentId: req.user._id,
      lecturerId: assignedLecturer,
      faculty: faculty || "",
      course: course || "",
      subject,
      question,
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
      .populate("lecturerId", "name email role")
      .populate("answeredBy", "name email role")
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
        .populate("studentId", "name email role")
        .populate("lecturerId", "name email role")
        .populate("answeredBy", "name email role")
        .sort({ createdAt: -1 });
    } else {
      messages = await Message.find({
        $or: [{ lecturerId: req.user._id }, { lecturerId: null }],
      })
        .populate("studentId", "name email role")
        .populate("lecturerId", "name email role")
        .populate("answeredBy", "name email role")
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
    const message = await Message.findById(req.params.id)
      .populate("studentId", "name email role")
      .populate("lecturerId", "name email role")
      .populate("answeredBy", "name email role");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (
      req.user.role === "lecturer" &&
      message.lecturerId &&
      String(message.lecturerId._id || message.lecturerId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
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
      return res.status(400).json({ message: "isPublic must be true or false" });
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
        message: "Forbidden: You can update visibility only for your own messages",
      });
    }

    message.isPublic = isPublic;
    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Update visibility error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Student: mark notification as seen
export const markAsNotified = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (String(message.studentId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    message.studentNotified = true;
    await message.save();

    return res.json(message);
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
      .populate("answeredBy", "name email role")
      .sort({ updatedAt: -1 });

    return res.json(messages);
  } catch (error) {
    console.error("Get public messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};