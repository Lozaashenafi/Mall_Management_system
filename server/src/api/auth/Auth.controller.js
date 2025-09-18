import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prismaClient.js";
import authSchema from "./Auth.schema.js";
import { UserRole, UserStatus } from "@prisma/client";

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
        status: UserStatus.Active, // ✅ matches enum
        phone: phone || null,
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
      message: " registered successfully",
      success: true,
      token,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Login Admin / Mall Owner
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

    res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
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
// Edit Profile with image upload
export const editProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const userId = req.user.userId;

    // If file uploaded, save its path
    let profilePicture;
    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        fullName,
        phone,
        ...(profilePicture && { profilePicture }),
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
