import express from "express";
import {
	createPoll,
	submitAnswer,
	getPollData,
	getAllPolls,
} from "../controllers/pollController.js";

const router = express.Router();

router.get("/", getPollData);
router.post("/create", createPoll);
router.post("/submit", submitAnswer);
router.get("/all", getAllPolls);
// TODO: Add update and delete routes

export default router;
