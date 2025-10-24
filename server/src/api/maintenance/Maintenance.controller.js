// controllers/maintenanceController.js
import prisma from "../../config/prismaClient.js";
import { createAuditLog } from "../../utils/audit.js";
import { createNotification } from "../notification/notification.service.js";
export const createMaintenance = async (req, res) => {
  try {
    const {
      roomId,
      description,
      cost,
      maintenanceStartDate,
      maintenanceEndDate,
    } = req.body;
    // chacke the room exists
    const room = await prisma.room.findUnique({
      where: { roomId: Number(roomId) },
    });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // 1. Try to find active rental for the room
    const rental = await prisma.rental.findFirst({
      where: {
        roomId: Number(roomId),
        status: "Active",
      },
      include: {
        tenant: {
          include: { user: true },
        },
      },
    });

    // 2. recordedBy = tenantId if found, else null
    const recordedBy = rental ? rental.tenantId : null;

    // 3. Create maintenance
    const maintenance = await prisma.maintenance.create({
      data: {
        roomId: Number(roomId),
        description,
        cost: cost ? Number(cost) : 0,
        maintenanceStartDate: new Date(maintenanceStartDate),
        maintenanceEndDate: maintenanceEndDate
          ? new Date(maintenanceEndDate)
          : null,
        recordedBy,
      },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Maintenance",
      recordId: maintenance.maintenanceId,
      newValue: maintenance,
    });

    if (rental && rental.tenant) {
      await createNotification({
        tenantId: rental.tenant.tenantId,
        userId: rental.tenant.user ? rental.tenant.user.userId : null,
        type: "Maintenance",
        message: `A maintenance request has been created for your room (${
          room.unitNumber || roomId
        }). 
        Description: ${description}`,
        sentVia: "System",
      });
    }

    res.json({ success: true, message: "Maintenance recorded", maintenance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllMaintenances = async (req, res) => {
  try {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        room: true,
        user: { select: { fullName: true } },
      },
    });
    res.json({ success: true, maintenances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "roomId",
      "description",
      "cost",
      "maintenanceStartDate",
      "maintenanceEndDate",
      "status",
      "recordedBy",
    ];

    // Pick only valid fields
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    // Ensure date strings are valid ISO
    if (data.maintenanceStartDate) {
      data.maintenanceStartDate = new Date(data.maintenanceStartDate);
    }
    if (data.maintenanceEndDate) {
      data.maintenanceEndDate = new Date(data.maintenanceEndDate);
    }

    const updated = await prisma.maintenance.update({
      where: { maintenanceId: Number(id) },
      data,
    });

    res.json({
      success: true,
      message: "Maintenance updated",
      maintenance: updated,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.maintenance.delete({ where: { maintenanceId: Number(id) } });
    res.json({ success: true, message: "Maintenance deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin: Get all tenant requests
export const getTenantsRequests = async (req, res) => {
  try {
    // only status == pending
    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "Pending" },
      include: {
        rental: {
          include: { room: true },
        },
      },
    });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1️⃣ Update the request
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { requestId: Number(id) },
      data: { status },
      include: {
        rental: {
          include: {
            room: true,
            tenant: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Maintenance request not found" });
    }

    let maintenance = null;

    // 2️⃣ If status is approved, create a maintenance record
    if (status === "Approved") {
      maintenance = await prisma.maintenance.create({
        data: {
          roomId: updatedRequest.rental.roomId,
          description: updatedRequest.description,
          cost: 0, // admin can update later
          maintenanceStartDate: new Date(),
          maintenanceEndDate: null,
          recordedBy: updatedRequest.rental.tenantId,
        },
      });
      console.log(
        "🧰 Maintenance created for approved request:",
        maintenance.maintenanceId
      );
    }

    // 3️⃣ Create an audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "MaintenanceRequest",
      recordId: updatedRequest.requestId,
      newValue: updatedRequest,
    });

    // 4️⃣ Send notification to tenant
    const tenant = updatedRequest.rental?.tenant;
    if (tenant) {
      const message =
        status === "Approved"
          ? `Your maintenance request for room ${updatedRequest.rental.room.unitNumber} has been approved.`
          : status === "Rejected"
          ? `Your maintenance request for room ${updatedRequest.rental.room.unitNumber} has been rejected.`
          : `Your maintenance request status has been updated to: ${status}.`;

      const notification = await createNotification({
        tenantId: tenant.tenantId,
        userId: tenant.user?.userId || null,
        type: "Maintenance",
        message,
        sentVia: "System",
      });
    } else {
      console.log("ℹ️ No tenant found for this maintenance request.");
    }

    // 5️⃣ Respond to client
    res.json({
      success: true,
      message: "Request status updated successfully",
      request: updatedRequest,
      maintenanceCreated: maintenance,
    });
  } catch (err) {
    console.error("❌ updateRequestStatus error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createMaintenanceRequest = async (req, res) => {
  try {
    const { rentId, description } = req.body;
    // 1️⃣ Validate rental
    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(rentId) },
      include: {
        room: true,
        tenant: {
          include: { user: true },
        },
      },
    });

    if (!rental || rental.status !== "Active") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or inactive rental ID" });
    }

    // 2️⃣ Create request
    const request = await prisma.maintenanceRequest.create({
      data: {
        rentId: Number(rentId),
        description,
      },
    });

    // 4️⃣ Notify admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["Admin", "SuperAdmin"] },
      },
      select: { userId: true },
    });

    const message = `New maintenance request from tenant ${
      rental.tenant?.contactPerson || "unknown"
    } for room ${rental.room.unitNumber}. Description: ${description}`;

    // Create notifications for each admin
    for (const admin of admins) {
      const notification = await createNotification({
        tenantId: rental.tenant?.tenantId || null,
        userId: admin.userId,
        type: "Maintenance",
        message,
        sentVia: "System",
      });
    }
    // 5️⃣ Response
    res.json({
      success: true,
      message: "Maintenance request submitted successfully",
      request,
    });
  } catch (err) {
    console.error("❌ createMaintenanceRequest error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Tenant: Get own requests
export const getTenantRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        rental: { tenant: { userId: Number(userId) } },
      },
      include: {
        rental: {
          include: { room: true },
        },
      },
    });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMaintenanceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await prisma.maintenanceRequest.delete({
      where: { requestId: Number(requestId) },
    });
    res.json({ success: true, message: "Request deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
