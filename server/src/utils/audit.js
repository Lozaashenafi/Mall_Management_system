// src/utils/audit.js
import prisma from "../config/prismaClient.js";

/**
 * Create an audit log entry
 * @param {Object} options
 * @param {number} options.userId - The user who performed the action
 * @param {string} options.action - "created", "updated", "deleted"
 * @param {string} options.tableName - Name of the table/model
 * @param {number} options.recordId - ID of the record affected
 * @param {object} [options.oldValue] - Old data (for update/delete)
 * @param {object} [options.newValue] - New data (for create/update)
 */
export const createAuditLog = async ({
  userId,
  action,
  tableName,
  recordId,
  oldValue = null,
  newValue = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValue,
        newValue,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error.message);
  }
};
