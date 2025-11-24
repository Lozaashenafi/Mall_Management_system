import express from "express";
import {
  addMaintenanceSchedule,
  deleteMaintenanceSchedule,
  getAllMaintenanceSchedules,
  getThisWeekMaintenanceSchedules,
  updateMaintenanceSchedule,
  updateStatusOfMaintenanceSchedule,
} from "./scheduling.controller.js";
import { isAdmin, userAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", userAuth, isAdmin, addMaintenanceSchedule);
router.get("/", userAuth, isAdmin, getAllMaintenanceSchedules);
router.put("/:scheduleId", userAuth, isAdmin, updateMaintenanceSchedule);
router.patch(
  "/status/:scheduleId",
  userAuth,
  isAdmin,
  updateStatusOfMaintenanceSchedule
);
router.delete("/:scheduleId", userAuth, isAdmin, deleteMaintenanceSchedule);
router.get("/week", userAuth, isAdmin, getThisWeekMaintenanceSchedules);

export default router;
