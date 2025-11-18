import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prismaClient.js";
import authSchema from "./Auth.schema.js";
import { UserRole, UserStatus } from "@prisma/client";
import { createAuditLog } from "../../utils/audit.js";

// Register Admin
export const register = async (req, res) => {
  try {
    const { error } = authSchema.register.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { fullName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin User
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: req.body.role || UserRole.Admin,
        status: UserStatus.Active,
        phone: phone || null,
      },
    });

    // Create Audit Log for user creation
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "User",
      recordId: user.userId,
      newValue: {
        fullName,
        email,
        role: user.role,
        status: user.status,
        phone,
      },
    });

    // JWT payload
    const tokenPayload = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.status(201).json({
      message: "Registered successfully",
      success: true,
      token,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: UserRole.User },
      select: {
        userId: true,
        fullName: true,
        email: true,
        profilePicture: true,
        role: true,
        status: true,
        phone: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Login Admin / Mall Owner / Tenant
export const login = async (req, res) => {
  try {
    const { error } = authSchema.login.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password. Please try again.",
        success: false,
      });
    }

    // JWT payload
    const tokenPayload = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    let tenantRentals = [];

    // 🔥 If user is a Tenant, fetch rental info based on linked Tenant entity
    if (user.role === "Tenant") {
      // Find tenant record that has same email OR linked via Tenant.email == User.email
      const tenant = await prisma.tenant.findFirst({
        where: { email: user.email },
      });

      if (tenant) {
        tenantRentals = await prisma.rental.findMany({
          where: { tenantId: tenant.tenantId },
          include: {
            room: true,
            invoices: {
              include: {
                payments: true,
                paymentRequest: true,
              },
            },
          },
        });
      }
    }

    res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        userId: user.userId,
        profilePicture: user.profilePicture,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        rentals: tenantRentals, // 👈 Added here
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
      success: false,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const userId = req.user.userId;

    // Find the current user to capture old values for audit
    const oldUser = await prisma.user.findUnique({ where: { userId } });
    if (!oldUser) return res.status(404).json({ message: "User not found" });

    // If file uploaded, save its path
    let profilePicture;
    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        fullName,
        phone,
        ...(profilePicture && { profilePicture }),
      },
    });

    // Create Audit Log
    await createAuditLog({
      userId, // the logged-in user performing the action
      action: "updated",
      tableName: "User",
      recordId: updatedUser.userId,
      oldValue: {
        fullName: oldUser.fullName,
        phone: oldUser.phone,
        profilePicture: oldUser.profilePicture,
      },
      newValue: {
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
      },
    });

    res.json({
      message: "Profile updated successfully",
      success: true,
      user: {
        userId: updatedUser.userId,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId; // assume auth middleware decoding JWT

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    // console.log("isMatch:", isMatch);
    // console.log("oldPassword:", oldPassword);
    // console.log(user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { userId },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: "Password changed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteUserRequest = async (req, res) => {
  try {
    const userIdInt = Number(req.params.userId);
    if (isNaN(userIdInt))
      return res.status(400).json({ message: "Invalid user ID" });

    const user = await prisma.user.findUnique({ where: { userId: userIdInt } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.update({
      where: { userId: userIdInt },
      data: { status: UserStatus.Inactive },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "User",
      recordId: user.userId,
      oldValue: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
      },
    });

    res.json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error(error); // log exact error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
