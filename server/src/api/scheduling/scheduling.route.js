import express from "express";
import {
  addMaintenanceSchedule,
  deleteMaintenanceScheduleOccurrence,
  getAllMaintenanceSchedules,
  getThisWeekMaintenanceOccurrences,
  updateMaintenanceSchedule,
  updateStatusOfMaintenanceScheduleOccurrence,
} from "./scheduling.controller.js";
import { isAdmin, userAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", userAuth, isAdmin, addMaintenanceSchedule);
router.get("/", userAuth, isAdmin, getAllMaintenanceSchedules);
router.put("/:scheduleId", userAuth, isAdmin, updateMaintenanceSchedule);
router.patch(
  "/status/:occurrenceId",
  userAuth,
  isAdmin,
  updateStatusOfMaintenanceScheduleOccurrence
);
router.delete(
  "/:occurrenceId",
  userAuth,
  isAdmin,
  deleteMaintenanceScheduleOccurrence
);
router.get("/week", userAuth, isAdmin, getThisWeekMaintenanceOccurrences);

export default router;
