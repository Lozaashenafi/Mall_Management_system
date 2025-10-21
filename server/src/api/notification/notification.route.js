import express from "express";
import { sendPaymentNotification } from "./notification.controller.js";

const router = express.Router();

// Send a new notification (Admin/system)
router.post("/", sendPaymentNotification);

export default router;
