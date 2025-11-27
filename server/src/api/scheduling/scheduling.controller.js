import prisma from "../../config/prismaClient.js";
import schedulingSchema from "./scheduling.schema.js";
import { createAuditLog } from "../../utils/audit.js";
export const addMaintenanceSchedule = async (req, res) => {
  try {
    const parsedData = schedulingSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsedData.error.errors,
      });
    }

    const {
      title,
      description,
      startDate,
      duedate,
      category,
      frequency,
      priority,
    } = parsedData.data;

    // Create the main schedule
    const newSchedule = await prisma.maintenanceSchedule.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        duedate: duedate ? new Date(duedate) : null,
        category,
        frequency,
        priority,
      },
    });

    // ---- Create FIRST OCCURRENCE ----
    await prisma.maintenanceScheduleOccurrence.create({
      data: {
        scheduleId: newSchedule.scheduleId,
        occurrenceDate: new Date(startDate),
        startDateTime: new Date(startDate),
        dueDate: duedate ? new Date(duedate) : null,
        status: "Upcoming", // add if your model has a status
      },
    });

    // ---- Log audit ----
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "MaintenanceSchedule",
      recordId: newSchedule.scheduleId,
      newValue: newSchedule,
    });

    return res.status(201).json({
      success: true,
      message: "Maintenance schedule added successfully",
      data: newSchedule,
    });
  } catch (error) {
    console.error("Error adding maintenance schedule:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllMaintenanceSchedules = async (req, res) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      orderBy: { startDate: "asc" },
      include: {
        occurrences: {
          orderBy: { occurrenceDate: "asc" },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Maintenance schedules retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    console.error("Error retrieving maintenance schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateMaintenanceSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Validate here
    const parsedData = schedulingSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsedData.error.errors,
      });
    }

    const {
      title,
      description,
      startDate,
      duedate,
      category,
      frequency,
      priority,
    } = parsedData.data;

    const updatedSchedule = await prisma.maintenanceSchedule.update({
      where: { scheduleId: Number(scheduleId) },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        duedate: new Date(duedate),
        category,
        frequency,
        priority,
      },
    });

    // ✅ Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "MaintenanceSchedule",
      recordId: updatedSchedule.scheduleId,
      newValue: updatedSchedule,
    });
    res.status(200).json({
      success: true,
      message: "Maintenance schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getThisWeekMaintenanceOccurrences = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - now.getDay() + 7); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const occurrences = await prisma.maintenanceScheduleOccurrence.findMany({
      where: {
        occurrenceDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        schedule: true, // include schedule details if needed
      },
      orderBy: { occurrenceDate: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "This week's maintenance occurrences retrieved successfully",
      data: occurrences,
    });
  } catch (error) {
    console.error(
      "Error retrieving this week's maintenance occurrences:",
      error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateStatusOfMaintenanceScheduleOccurrence = async (req, res) => {
  try {
    const { occurrenceId } = req.params;
    if (!occurrenceId) {
      return res
        .status(400)
        .json({ message: "occurrenceId is required in params" });
    }

    const occurrenceIdNum = parseInt(occurrenceId, 10);
    if (isNaN(occurrenceIdNum)) {
      return res
        .status(400)
        .json({ message: "occurrenceId must be a valid number" });
    }

    const { status, cost, adminNote } = req.body;

    const updateData = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const updatedOccurrence = await prisma.maintenanceScheduleOccurrence.update(
      {
        where: { occurrenceId: occurrenceIdNum },
        data: updateData,
        include: { schedule: true },
      }
    );

    // If occurrence is marked Done, create actual maintenance record
    if (status.toLowerCase() === "done") {
      await prisma.maintenance.create({
        data: {
          description: `Maintenance for schedule: ${updatedOccurrence.schedule.title}`,
          maintenanceStartDate:
            updatedOccurrence.startDateTime || updatedOccurrence.occurrenceDate,
          maintenanceEndDate: new Date(),
          status: "Completed",
          cost: cost || 0,
          roomId: null, // adjust if linked to a room
        },
      });
    }

    await createAuditLog({
      userId: req.user.userId,
      action: "updated_occurrence_status",
      tableName: "MaintenanceScheduleOccurrence",
      recordId: updatedOccurrence.occurrenceId,
      newValue: updatedOccurrence,
    });

    res.status(200).json({
      success: true,
      message: "Maintenance schedule occurrence status updated successfully",
      data: updatedOccurrence,
    });
  } catch (error) {
    console.error(
      "Error updating maintenance schedule occurrence status:",
      error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteMaintenanceScheduleOccurrence = async (req, res) => {
  try {
    const { occurrenceId } = req.params;

    const occurrence = await prisma.maintenanceScheduleOccurrence.findUnique({
      where: { occurrenceId: Number(occurrenceId) },
    });

    if (!occurrence) {
      return res.status(404).json({
        success: false,
        message: "Occurrence not found",
      });
    }

    if (occurrence.status.toLowerCase() !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming occurrences can be deleted",
      });
    }

    await prisma.maintenanceScheduleOccurrence.delete({
      where: { occurrenceId: Number(occurrenceId) },
    });

    res.status(200).json({
      success: true,
      message: "Maintenance schedule occurrence deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance schedule occurrence:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
