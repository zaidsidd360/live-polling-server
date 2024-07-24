// models/Poll.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const PollSchema = new Schema({
	question: {
		type: String,
		required: true,
	},
	options: {
		type: [String],
		required: true,
	},
	duration: {
		type: Number,
		default: 60, // Default duration is 60 seconds
	},
	correctOption: {
		type: Number,
		required: false,
	},
	answers: {
		type: Map,
		of: Number,
		default: {},
	},
	results: {
		type: Map,
		of: Number,
		default: {},
	},
	hasEnded: {
		type: Boolean,
		default: false,
	},
});

const Poll = mongoose.model("Poll", PollSchema);

export default Poll;
