import Feedback from "./feedback.model.js";
import Ticket from "../ticketRaising/ticket.model.js";

export const createFeedback = async (req, res) => {
	try {
		const { ticketId, comment, rating } = req.body;
		const numericRating = Number(rating);

		if (!ticketId || !comment || !rating) {
			return res.status(400).json({ message: "Ticket ID, comment and rating are required" });
		}

		if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
			return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
		}

		const ticket = await Ticket.findOne({ ticketId: String(ticketId).trim() });
		if (!ticket) {
			return res.status(404).json({ message: "Ticket not found" });
		}

		if (String(ticket.studentId) !== String(req.user._id)) {
			return res.status(403).json({ message: "You can only submit feedback for your own ticket" });
		}

		const existingFeedback = await Feedback.findOne({
			studentId: String(req.user._id),
			ticketId: ticket.ticketId,
		});
		if (existingFeedback) {
			return res.status(409).json({ message: "Feedback already submitted for this ticket" });
		}

		const feedback = await Feedback.create({
			studentId: String(req.user._id),
			studentName: req.user.name,
			ticketId: ticket.ticketId,
			comment,
			rating: numericRating,
		});

		return res.status(201).json(feedback);
	} catch (error) {
		console.error("Create feedback error:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

export const getMyFeedback = async (req, res) => {
	try {
		const feedback = await Feedback.find({ studentId: String(req.user._id) }).sort({ createdAt: -1 });
		return res.json(feedback);
	} catch (error) {
		console.error("Get my feedback error:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

export const getAllFeedback = async (_req, res) => {
	try {
		const feedback = await Feedback.find().sort({ createdAt: -1 });
		return res.json(feedback);
	} catch (error) {
		console.error("Get all feedback error:", error);
		return res.status(500).json({ message: "Server error" });
	}
};
