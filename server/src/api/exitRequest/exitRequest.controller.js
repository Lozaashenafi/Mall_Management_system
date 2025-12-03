import prisma from "../../config/prismaClient.js";
import exitRequestSchema from "./exitRequest.schema.js";
import { createAuditLog } from "../../utils/audit.js";
import { createNotification } from "../notification/notification.service.js";
import { generateTrackingNumber } from "../../utils/helpers.js";

// ====================== TENANT ENDPOINTS ======================

/**
 * Create exit request (Tenant)
 */
export const createExitRequest = async (req, res) => {
  try {
    const { error, value } = exitRequestSchema.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { userId, rentId, exitDate, purpose, type, items } = value;

    // First, find the tenant associated with this userId
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: Number(userId),
        status: "Active",
      },
      include: { user: true },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or account is not active",
      });
    }

    // Now use tenant.tenantId
    const tenantId = tenant.tenantId;

    // Verify rental exists and is active
    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(rentId) },
      include: { tenant: true },
    });

    if (!rental || rental.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Rental not found or not active",
      });
    }

    if (rental.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Rental does not belong to this tenant",
      });
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    const result = await prisma.$transaction(async (tx) => {
      // Create exit request
      const exitRequest = await tx.exitRequest.create({
        data: {
          trackingNumber,
          tenantId, // Use the resolved tenantId
          rentId,
          exitDate: new Date(exitDate),
          purpose,
          type,
          status: "Pending",
        },
      });

      // Create exit request items
      await tx.exitRequestItem.createMany({
        data: items.map((item) => ({
          exitRequestId: exitRequest.requestId,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          serialNumber: item.serialNumber,
          estimatedValue: item.estimatedValue,
        })),
      });

      // Get complete exit request with items
      const completeRequest = await tx.exitRequest.findUnique({
        where: { requestId: exitRequest.requestId },
        include: {
          items: true,
          tenant: {
            include: { user: true },
          },
          rental: {
            include: { room: true },
          },
        },
      });

      return completeRequest;
    });

    // Create audit log
    await createAuditLog({
      userId: tenant.userId,
      action: "created",
      tableName: "ExitRequest",
      recordId: result.requestId,
      newValue: {
        trackingNumber: result.trackingNumber,
        status: result.status,
        type: result.type,
      },
    });

    // Send notification to admin
    const admins = await prisma.user.findMany({
      where: { role: { in: ["Admin", "SuperAdmin"] } },
    });

    admins.forEach((admin) => {
      createNotification({
        userId: admin.userId,
        type: "ExitRequestSubmitted",
        message: `New exit request submitted by ${tenant.companyName}. Tracking #: ${trackingNumber}`,
        sentVia: "System",
      });
    });

    res.status(201).json({
      success: true,
      message: "Exit request submitted successfully",
      data: {
        requestId: result.requestId,
        trackingNumber: result.trackingNumber,
        status: result.status,
        items: result.items,
      },
    });
  } catch (err) {
    console.error("createExitRequest error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Get tenant's exit requests (Tenant)
 */ /**
 * Get tenant's exit requests (Tenant)
 */
export const getMyExitRequests = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Find the tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: userId,
        status: "Active",
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or account is not active",
      });
    }

    // Get all exit requests for this tenant
    const requests = await prisma.exitRequest.findMany({
      where: {
        tenantId: tenant.tenantId,
      },
      include: {
        items: true,
        tenant: {
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        rental: {
          include: {
            room: true,
          },
        },
        securityOfficer: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        // NO adminOfficer field exists - remove it
      },
      orderBy: { requestDate: "desc" },
      take: 500,
    });

    // Get total count
    const total = await prisma.exitRequest.count({
      where: {
        tenantId: tenant.tenantId,
      },
    });

    res.json({
      success: true,
      data: requests,
      total: total,
      message:
        total > 500
          ? `Showing latest 500 of ${total} requests. Use filters to find older requests.`
          : undefined,
    });
  } catch (err) {
    console.error("getMyExitRequests error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
// backend controller
export const getExitRequestById = async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID format",
      });
    }

    const exitRequest = await prisma.exitRequest.findUnique({
      where: {
        requestId: requestId,
      },
      include: {
        // Add necessary includes based on what your frontend expects
        rental: {
          include: {
            room: true,
          },
        },
        tenant: true,
        items: true,
        securityOfficer: true,
      },
    });

    if (!exitRequest) {
      return res.status(404).json({
        success: false,
        message: "Exit request not found",
      });
    }

    // Wrap the response in a data property
    res.json({
      success: true,
      data: exitRequest, // Wrap it here
    });
  } catch (err) {
    console.error("getExitRequestById error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
// ====================== ADMIN ENDPOINTS ======================

/**
 * Get all exit requests for admin (filtered)
 */
export const getAllExitRequests = async (req, res) => {
  try {
    const { error, value } = exitRequestSchema.filter.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { status, type, startDate, endDate, tenantId, page, limit } = value;
    const skip = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (tenantId) where.tenantId = Number(tenantId);
    if (startDate || endDate) {
      where.exitDate = {};
      if (startDate) where.exitDate.gte = new Date(startDate);
      if (endDate) where.exitDate.lte = new Date(endDate);
    }

    const [requests, total] = await Promise.all([
      prisma.exitRequest.findMany({
        where,
        include: {
          items: true,
          tenant: {
            include: {
              user: {
                select: {
                  userId: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
              companyName: true,
              contactPerson: true,
            },
          },
          rental: {
            include: {
              room: true,
            },
          },
        },
        orderBy: { requestDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.exitRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllExitRequests error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Admin review (approve/reject) exit request
 */
export const reviewExitRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { error, value } = exitRequestSchema.adminReview.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { status, adminNote } = value;

    // Get current request
    const existingRequest = await prisma.exitRequest.findUnique({
      where: { requestId: Number(requestId) },
      include: {
        tenant: {
          include: { user: true },
        },
      },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Exit request not found",
      });
    }

    if (existingRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot review request with status: ${existingRequest.status}`,
      });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update exit request
      const request = await tx.exitRequest.update({
        where: { requestId: Number(requestId) },
        data: {
          status,
          adminNote,
          updatedAt: new Date(),
        },
        include: {
          tenant: {
            include: { user: true },
          },
          items: true,
        },
      });

      // Create audit log
      await createAuditLog({
        userId: req.user.userId,
        action: status === "Approved" ? "approved" : "rejected",
        tableName: "ExitRequest",
        recordId: request.requestId,
        oldValue: {
          status: existingRequest.status,
          adminNote: existingRequest.adminNote,
        },
        newValue: {
          status: request.status,
          adminNote: request.adminNote,
        },
      });

      return request;
    });

    // Send notifications
    const tenantUser = updatedRequest.tenant.user;

    // Notify tenant
    createNotification({
      userId: tenantUser.userId,
      type:
        status === "Approved" ? "ExitRequestApproved" : "ExitRequestRejected",
      message: `Your exit request #${
        updatedRequest.trackingNumber
      } has been ${status.toLowerCase()}. ${
        adminNote ? `Admin note: ${adminNote}` : ""
      }`,
      sentVia: "System",
    });

    // Notify security officers if approved
    if (status === "Approved") {
      const securityOfficers = await prisma.user.findMany({
        where: { role: "SecurityOfficer" },
      });

      securityOfficers.forEach((officer) => {
        createNotification({
          userId: officer.userId,
          type: "ExitRequestApproved",
          message: `New approved exit request for verification. Tracking #: ${updatedRequest.trackingNumber}`,
          sentVia: "System",
        });
      });
    }

    res.json({
      success: true,
      message: `Exit request ${status.toLowerCase()} successfully`,
      data: updatedRequest,
    });
  } catch (err) {
    console.error("reviewExitRequest error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ====================== SECURITY OFFICER ENDPOINTS ======================

/**
 * Get approved exit requests for security verification
 */
export const getApprovedExitRequests = async (req, res) => {
  try {
    const { error, value } = exitRequestSchema.filter.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    const where = {
      status: "Approved",
    };

    const [requests, total] = await Promise.all([
      prisma.exitRequest.findMany({
        where,
        include: {
          items: true,
          tenant: {
            include: {
              user: {
                select: {
                  userId: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
              companyName: true,
              contactPerson: true,
            },
          },
          rental: {
            include: {
              room: true,
            },
          },
        },
        orderBy: { exitDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.exitRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getApprovedExitRequests error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Security officer verification (verify/block)
 */
export const verifyExitRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { error, value } = exitRequestSchema.securityVerify.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { status, securityNote } = value;
    const securityOfficerId = req.user.userId;

    // Get current request
    const existingRequest = await prisma.exitRequest.findUnique({
      where: { requestId: Number(requestId) },
      include: {
        tenant: {
          include: { user: true },
        },
      },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Exit request not found",
      });
    }

    if (existingRequest.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Request must be 'Approved' for verification. Current status: ${existingRequest.status}`,
      });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update exit request
      const request = await tx.exitRequest.update({
        where: { requestId: Number(requestId) },
        data: {
          status,
          securityNote,
          verifiedBy: securityOfficerId,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          tenant: {
            include: { user: true },
          },
          items: true,
          securityOfficer: {
            select: {
              userId: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await createAuditLog({
        userId: securityOfficerId,
        action: status === "Verified" ? "verified" : "blocked",
        tableName: "ExitRequest",
        recordId: request.requestId,
        oldValue: {
          status: existingRequest.status,
          securityNote: existingRequest.securityNote,
          verifiedBy: existingRequest.verifiedBy,
        },
        newValue: {
          status: request.status,
          securityNote: request.securityNote,
          verifiedBy: request.verifiedBy,
          verifiedAt: request.verifiedAt,
        },
      });

      return request;
    });

    // Send notifications
    const tenantUser = updatedRequest.tenant.user;

    // Notify tenant
    createNotification({
      userId: tenantUser.userId,
      type:
        status === "Verified" ? "ExitRequestVerified" : "ExitRequestBlocked",
      message: `Your exit request #${
        updatedRequest.trackingNumber
      } has been ${status.toLowerCase()} by security.`,
      sentVia: "System",
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["Admin", "SuperAdmin"] } },
    });

    admins.forEach((admin) => {
      createNotification({
        userId: admin.userId,
        type:
          status === "Verified" ? "ExitRequestVerified" : "ExitRequestBlocked",
        message: `Exit request #${
          updatedRequest.trackingNumber
        } has been ${status.toLowerCase()} by security officer.`,
        sentVia: "System",
      });
    });

    res.json({
      success: true,
      message: `Exit request ${status.toLowerCase()} successfully`,
      data: updatedRequest,
    });
  } catch (err) {
    console.error("verifyExitRequest error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Get exit request by tracking number (Security)
 */
export const getExitRequestByTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const exitRequest = await prisma.exitRequest.findUnique({
      where: { trackingNumber },
      include: {
        items: true,
        tenant: {
          include: {
            user: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            companyName: true,
            contactPerson: true,
          },
        },
        rental: {
          include: {
            room: true,
          },
        },
        securityOfficer: {
          select: {
            userId: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!exitRequest) {
      return res.status(404).json({
        success: false,
        message: "Exit request not found",
      });
    }

    res.json({
      success: true,
      data: exitRequest,
    });
  } catch (err) {
    console.error("getExitRequestByTracking error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
