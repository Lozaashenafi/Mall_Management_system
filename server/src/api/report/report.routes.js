import express from "express";
import { getComprehensiveReport } from "./report.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.get("/summary", userAuth, isAdmin, getComprehensiveReport);

export default router;
