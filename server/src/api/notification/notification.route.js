import express from "express";
import {
  getAllNotifications,
  markAsRead,
  deleteNotification,
} from "./notification.controller.js";

const router = express.Router();

router.get("/:id", getAllNotifications);
router.patch("/read/:id", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
