import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import pollRoutes from "./routes/pollRoutes.js";
import * as pollController from "./controllers/pollController.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error("MongoDB URI is not defined in the .env file");
	process.exit(1);
}

const app = express();

mongoose
	.connect(MONGODB_URI)
	.then(() => console.log("MongoDB is open for queries"))
	.catch((err) => {
		console.error("Error connecting to MongoDB Atlas:", err);
		process.exit(1); // Exit the process if connection fails
	});

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/poll", pollRoutes);

// Socket.io connection handling
io.on("connection", (socket) => {
	console.log("A user connected");

	// Emit current poll data to the new connection
	pollController
		.getPollDataForSocket()
		.then((pollData) => {
			socket.emit("updatePollData", pollData);
		})
		.catch((err) => {
			console.error("Error fetching poll data:", err);
		});

	socket.on("createPoll", async (data) => {
		try {
			await pollController.createPollForSocket(data);
			const updatedPollData = await pollController.getPollDataForSocket();
			io.emit("updatePollData", updatedPollData);
		} catch (err) {
			console.error("Error creating poll:", err);
		}
	});

	socket.on("submitAnswer", async ({ studentName, answer }) => {
		try {
			await pollController.submitAnswerForSocket(studentName, answer);
			const updatedPollData = await pollController.getPollDataForSocket();
			io.emit("updatePollData", updatedPollData);
			console.log("Answer submitted successfully!");
		} catch (err) {
			console.error("Error submitting answer:", err);
		}
	});

	socket.on("endCurrentPoll", async () => {
		try {
			await pollController.endCurrentPollForSocket();
			const updatedPollData = await pollController.getPollDataForSocket();
			io.emit("updatePollData", updatedPollData);
		} catch (err) {
			console.error("Error ending current poll:", err);
		}
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected");
	});
});

// Start the server
server.listen(5000, () => {
	console.log("Server is running on port 5000");
});
