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
      recurrenceRule,
      category,
      frequency,
      priority,
    } = parsedData.data;

    const newSchedule = await prisma.maintenanceSchedule.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        duedate: duedate ? new Date(duedate) : null,
        recurrenceRule,
        category,
        frequency,
        priority,
      },
    });

    // Log

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "MaintenanceSchedule",
      recordId: newSchedule.scheduleId,
      newValue: newSchedule,
    });

    res.status(201).json({
      success: true,
      message: "Maintenance schedule added successfully",
      data: newSchedule,
    });
  } catch (error) {
    console.error("Error adding maintenance schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllMaintenanceSchedules = async (req, res) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      orderBy: { startDate: "asc" },
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
      recurrenceRule,
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
        duedate: duedate ? new Date(duedate) : null,
        recurrenceRule,
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
// get this week schedules
export const getThisWeekMaintenanceSchedules = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: {
        startDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: { startDate: "asc" },
    });
    res.status(200).json({
      success: true,
      message: "This week's maintenance schedules retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    console.error("Error retrieving this week's maintenance schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateStatusOfMaintenanceSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { status, cost } = req.body;
    const updatedSchedule = await prisma.maintenanceSchedule.update({
      where: { scheduleId: Number(scheduleId) },
      data: { status },
    });
    // add maintenance if the status is completed
    if (status === "Done") {
      await prisma.maintenance.create({
        data: {
          description: `Maintenance for schedule: ${updatedSchedule.title}`,
          maintenanceStartDate: new Date(updatedSchedule.startDate),
          maintenanceEndDate: new Date(),
          cost: cost || 0,
          roomId: null,
        },
      });
    }

    // ✅ Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "updated_status",
      tableName: "MaintenanceSchedule",
      recordId: updatedSchedule.scheduleId,
      newValue: updatedSchedule,
    });
    res.status(200).json({
      success: true,
      message: "Maintenance schedule status updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating maintenance schedule status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteMaintenanceSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    //  only upcomming schedules can be deleted
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { scheduleId: Number(scheduleId) },
    });
    if (schedule.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming schedules can be deleted",
      });
    }

    await prisma.maintenanceSchedule.delete({
      where: { scheduleId: Number(scheduleId) },
    });
    res.status(200).json({
      success: true,
      message: "Maintenance schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
