import prisma from "../../config/prismaClient.js";
import { createAuditLog } from "../../utils/audit.js";
import terminateSchema from "./terminate.schema.js";

export const addTerminateRequest = async (req, res) => {
  try {
    const { error } = terminateSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { rentId, reason, effectiveDate } = req.body;

    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(rentId) },
    });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const terminateRequest = await prisma.terminateRequest.create({
      data: {
        rentId: Number(rentId),
        reason,
        preferredTerminationDate: effectiveDate
          ? new Date(effectiveDate)
          : null,
      },
      include: { rental: true },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "TerminateRequest",
      recordId: terminateRequest.terminateRequestId,
      newValue: terminateRequest,
    });

    res.status(201).json({
      success: true,
      message: "Termination request submitted successfully",
      terminateRequest,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const editTerminateRequest = async (req, res) => {
  try {
    const { error } = terminateSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const { reason, effectiveDate } = req.body;

    const oldRequest = await prisma.terminateRequest.findUnique({
      where: { terminateRequestId: Number(id) },
    });
    if (!oldRequest)
      return res.status(404).json({ message: "Termination request not found" });

    if (oldRequest.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending requests can be edited" });

    const updated = await prisma.terminateRequest.update({
      where: { terminateRequestId: Number(id) },
      data: {
        reason: reason || oldRequest.reason,
        preferredTerminationDate: effectiveDate
          ? new Date(effectiveDate)
          : oldRequest.preferredTerminationDate,
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "TerminateRequest",
      recordId: updated.terminateRequestId,
      oldValue: oldRequest,
      newValue: updated,
    });

    res.json({
      success: true,
      message: "Termination request updated",
      updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Termination Request (Tenant)
export const deleteTerminateRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const oldRequest = await prisma.terminateRequest.findUnique({
      where: { terminateRequestId: Number(id) },
    });
    if (!oldRequest)
      return res.status(404).json({ message: "Termination request not found" });

    if (oldRequest.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending requests can be deleted" });

    await prisma.terminateRequest.delete({
      where: { terminateRequestId: Number(id) },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "TerminateRequest",
      recordId: oldRequest.terminateRequestId,
      oldValue: oldRequest,
    });

    res.json({
      success: true,
      message: "Termination request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTerminateRequest = async (req, res) => {
  try {
    const requests = await prisma.terminateRequest.findMany({
      include: { rental: { include: { tenant: true, room: true } } },
      orderBy: { requestDate: "desc" },
    });

    res.json({ success: true, terminateRequests: requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Termination Request By ID (Tenant/Admin)
export const getTerminateRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const terminateRequest = await prisma.terminateRequest.findUnique({
      where: { terminateRequestId: Number(id) },
      include: { rental: { include: { tenant: true, room: true } } },
    });

    if (!terminateRequest)
      return res.status(404).json({ message: "Termination request not found" });

    res.json({ success: true, terminateRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addTerminateRequestByAdmin = async (req, res) => {
  try {
    const { error } = terminateSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { rentId, reason, effectiveDate, adminNote } = req.body;

    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(rentId) },
    });
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const terminateRequest = await prisma.terminateRequest.create({
      data: {
        rentId: Number(rentId),
        reason,
        preferredTerminationDate: effectiveDate
          ? new Date(effectiveDate)
          : null,
        adminNote,
        status: "Approved",
      },
      include: { rental: true },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "TerminateRequest",
      recordId: terminateRequest.terminateRequestId,
      newValue: terminateRequest,
    });

    res.status(201).json({
      success: true,
      message: "Termination request created by admin",
      terminateRequest,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Termination Request Status (Admin)
export const adminUpdateTerminateRequestStatus = async (req, res) => {
  try {
    const { error } = terminateSchema.adminUpdate.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const { status, adminNote, effectiveDate } = req.body;

    const oldRequest = await prisma.terminateRequest.findUnique({
      where: { terminateRequestId: Number(id) },
    });
    if (!oldRequest)
      return res.status(404).json({ message: "Termination request not found" });

    const updated = await prisma.terminateRequest.update({
      where: { terminateRequestId: Number(id) },
      data: {
        status,
        adminNote: adminNote ?? oldRequest.adminNote,
        preferredTerminationDate: effectiveDate
          ? new Date(effectiveDate)
          : oldRequest.preferredTerminationDate,
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "TerminateRequest",
      recordId: updated.terminateRequestId,
      oldValue: oldRequest,
      newValue: updated,
    });

    res.json({
      success: true,
      message: "Termination request updated successfully",
      updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
