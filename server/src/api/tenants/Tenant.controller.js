import bcrypt from "bcryptjs";
import prisma from "../../config/prismaClient.js";
import tenantSchema from "./Tenant.schema.js";
import { UserRole, UserStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import { createAuditLog } from "../../utils/audit.js"; // adjust path if needed
// ✅ Add Tenant
export const addTenant = async (req, res) => {
  try {
    const { error } = tenantSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { companyName, contactPerson, phone, email, tinNumber, vatNumber } =
      req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const existingTenant = await prisma.tenant.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingTenant)
      return res
        .status(400)
        .json({ message: "Tenant with this email already exists" });

    // Check if user already exists with this email
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    // ✅ Handle file uploads
    const files = req.files || {};
    const identificationDocument = files.identificationDocument?.[0]
      ? `/uploads/${files.identificationDocument[0].filename}`
      : null;
    const businessLicense = files.businessLicense?.[0]
      ? `/uploads/${files.businessLicense[0].filename}`
      : null;

    // Generate password & create linked user
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    // chack email

    const user = await prisma.user.create({
      data: {
        fullName: contactPerson,
        email,
        phone,
        passwordHash: hashedPassword,
        role: UserRole.Tenant,
        status: UserStatus.Active,
      },
    });

    // ✅ Create tenant record
    const tenant = await prisma.tenant.create({
      data: {
        companyName,
        userId: user.userId,
        contactPerson,
        phone,
        email,
        tinNumber,
        vatNumber,
        identificationDocument,
        businessLicense,
        status: "Active",
      },
    });

    // ✅ Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Tenant",
      recordId: tenant.tenantId,
      newValue: tenant,
    });

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Mall Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Tenant Account Created",
      text: `Hello ${contactPerson},\n\nYour tenant account has been created.\n\nLogin Email: ${email}\nPassword: ${plainPassword}\n\nPlease change your password immediately.\n\n- Mall Management System`,
    });

    res.status(201).json({
      message: "Tenant and user account created successfully",
      success: true,
      tenant,
      user: { userId: user.userId, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Tenants
export const getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        rental: true,
        notifications: true,
        feedbacks: true,
      },
    });

    res.json({ success: true, tenants });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Tenant by ID
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { tenantId: Number(id) },
      include: {
        rental: true,
        notifications: true,
        feedbacks: true,
      },
    });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.json({ success: true, tenant });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Edit Tenant
export const editTenant = async (req, res) => {
  try {
    const { error } = tenantSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;

    const oldTenant = await prisma.tenant.findUnique({
      where: { tenantId: Number(id) },
    });
    if (!oldTenant)
      return res.status(404).json({ message: "Tenant not found" });
    const files = req.files || {};
    const updateData = { ...req.body };

    if (files.identificationDocument?.[0])
      updateData.identificationDocument = `/uploads/${files.identificationDocument[0].filename}`;
    if (files.businessLicense?.[0])
      updateData.businessLicense = `/uploads/${files.businessLicense[0].filename}`;

    const tenant = await prisma.tenant.update({
      where: { tenantId: Number(id) },
      data: updateData,
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Tenant",
      recordId: tenant.tenantId,
      oldValue: oldTenant,
      newValue: tenant,
    });

    res.json({ message: "Tenant updated successfully", success: true, tenant });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Tenant
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const oldTenant = await prisma.tenant.findUnique({
      where: { tenantId: Number(id) },
    });
    if (!oldTenant)
      return res.status(404).json({ message: "Tenant not found" });

    await prisma.tenant.delete({
      where: { tenantId: Number(id) },
    });

    // ✅ Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "Tenant",
      recordId: oldTenant.tenantId,
      oldValue: oldTenant,
    });

    res.json({ message: "Tenant deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
