import express from "express";
import prisma from "../config/prismaClient.js";
import { userAuth, isAdmin } from "../middleware/auth.js"; // protect the route

const router = express.Router();
router.get("/recent", userAuth, isAdmin, async (req, res) => {
  try {
    // Get current date/time
    const now = new Date();

    // 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2); // 48 hours back

    // Fetch logs from the last 2 days
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: twoDaysAgo, // greater than or equal to 2 days ago
        },
      },
      orderBy: { timestamp: "desc" },
      include: { user: true },
    });

    // Format logs for frontend
    const formattedLogs = logs.map((log) => ({
      logId: log.logId,
      userId: log.userId,
      userFullName: log.user.fullName,
      action: log.action,
      tableName: log.tableName,
      recordId: log.recordId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      timestamp: log.timestamp,
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error("Failed to fetch recent audit logs:", error);
    res.status(500).json({
      message: "Failed to fetch recent audit logs",
      error: error.message,
    });
  }
});

router.get("/", userAuth, isAdmin, async (req, res) => {
  try {
    // Fetch logs from the database with user info
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: { user: true }, // include the user who performed the action
    });

    // Format logs for frontend
    const formattedLogs = logs.map((log) => ({
      logId: log.logId,
      userId: log.userId,
      userFullName: log.user.fullName,
      action: log.action,
      tableName: log.tableName,
      recordId: log.recordId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      timestamp: log.timestamp,
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch audit logs", error: error.message });
  }
});

export default router;
