import Poll from "../models/Poll.js";

// Function to get poll data for HTTP requests
export const getPollData = async (req, res) => {
	try {
		const poll = await Poll.findOne({ hasEnded: false });
		if (!poll) {
			return res.json({
				question: "",
				options: [],
				duration: 60,
				correctOption: null,
				answers: {},
				results: {},
				hasEnded: false,
			});
		}
		return res.json(poll);
	} catch (error) {
		console.error("Error fetching poll data:", error.message);
		res.status(500).json({ error: "Error fetching poll data" });
	}
};

// Function to get poll data for Socket.io
export const getPollDataForSocket = async () => {
	try {
		const poll = await Poll.findOne({ hasEnded: false });
		if (!poll) {
			return {
				question: "",
				options: [],
				duration: 60,
				correctOption: null,
				answers: {},
				results: {},
				hasEnded: false,
			};
		}
		return poll;
	} catch (error) {
		console.error("Error fetching poll data:", error.message);
		throw new Error("Error fetching poll data");
	}
};

// Function to create a new poll for HTTP requests
export const createPoll = async (req, res) => {
	try {
		const activePoll = await Poll.findOne({ hasEnded: false });
		if (activePoll) {
			return res.status(400).json({
				error: "An active poll already exists. Please end the current poll before creating a new one.",
			});
		}

		const data = req.body;
		const newPoll = new Poll(data);
		await newPoll.save();
		res.status(201).json(newPoll);
	} catch (error) {
		console.error("Error creating poll:", error.message);
		res.status(500).json({ error: "Error creating poll" });
	}
};

// Function to create a new poll for Socket.io
export const createPollForSocket = async (data) => {
	try {
		const activePoll = await Poll.findOne({ hasEnded: false });
		if (activePoll) {
			throw new Error(
				"An active poll already exists. Please end the current poll before creating a new one."
			);
		}

		const newPoll = new Poll(data);
		await newPoll.save();
		return newPoll;
	} catch (error) {
		console.error("Error creating poll:", error.message);
		throw new Error("Error creating poll");
	}
};

// Function to submit an answer for HTTP requests
export const submitAnswer = async (req, res) => {
	try {
		const { studentName, answer } = req.body;
		const pollData = await Poll.findOne({ hasEnded: false });
		if (!pollData) {
			return res.status(404).json({ error: "Poll data not found" });
		}
		pollData.answers[studentName] = answer;
		pollData.results[answer] = (pollData.results[answer] || 0) + 1;
		await pollData.save();
		res.status(200).json(pollData);
	} catch (error) {
		console.error("Error submitting answer:", error.message);
		res.status(500).json({ error: "Error submitting answer" });
	}
};

// Function to submit an answer for Socket.io
export const submitAnswerForSocket = async (studentName, answer) => {
	try {
		const pollData = await Poll.findOne({ hasEnded: false });
		if (!pollData) {
			throw new Error("Poll data not found");
		}
		console.log(pollData);
		// const answerCount = [...pollData.results].find(
		// 	(_, key) => key === answer
		// )[1];
		// const answerCount = pollData.results.get(answer);
		const answerCount = pollData.results.get(`${answer}`) || 0;
		await Poll.updateOne(
			{ hasEnded: false },
			{
				$set: {
					[`answers.${studentName}`]: answer,
					[`results.${answer}`]: answerCount + 1,
				},
			}
		);
		console.log(
			`Answer submitted successfully! from controller by ${studentName}`
		);
		return pollData;
	} catch (error) {
		console.error("Error submitting answer:", error.message);
		throw new Error("Error submitting answer");
	}
};

// Function to delete the current poll for HTTP requests
export const deletePoll = async (req, res) => {
	try {
		const result = await Poll.deleteMany({});
		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "No poll found to delete" });
		}
		res.status(200).json({ message: "Poll deleted successfully" });
	} catch (error) {
		console.error("Error deleting poll:", error.message);
		res.status(500).json({
			message: "Error deleting poll",
			error: error.message,
		});
	}
};

export const endCurrentPollForSocket = async () => {
	try {
		const pollData = await Poll.findOne({ hasEnded: false });
		if (!pollData) {
			throw new Error("Poll data not found");
		}

		await Poll.updateOne(
			{ hasEnded: false },
			{
				$set: {
					hasEnded: true,
				},
			}
		);
	} catch (error) {
		console.error("Error deleting poll:", error.message);
		throw new Error("Error deleting poll");
	}
};

// Function to get all polls for HTTP requests
export const getAllPolls = async (req, res) => {
	try {
		const polls = await Poll.find();
		res.status(200).json(polls);
	} catch (error) {
		console.error("Error fetching all polls:", error.message);
		res.status(500).json({
			error: "An error occurred while fetching polls",
		});
	}
};
