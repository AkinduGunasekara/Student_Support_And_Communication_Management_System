import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
	{
		studentId: {
			type: String,
			required: true,
			index: true,
		},
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		ticketId: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		comment: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1000,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
	},
	{ timestamps: true }
);

feedbackSchema.index({ studentId: 1, ticketId: 1 }, { unique: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
