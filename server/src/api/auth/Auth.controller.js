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
        role: UserRole.Admin, // ✅ matches enum
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
      message: "Admin registered successfully",
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
