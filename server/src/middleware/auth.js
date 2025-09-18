import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import config from "../config/index.js";

const { JWT_SECRET } = config;

// Middleware to verify JWT and attach user to req.user
const userAuth = async (req, res, next) => {
  // console.log("Headers:", req.headers);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({
      message: "Authorization header missing",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      message: "Token not found",
      success: false,
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Fetch user from Prisma using correct model & field names
    const user = await prisma.user.findUnique({
      where: { userId: payload.userId },
    });

    if (!user) {
      return res.status(403).json({
        message: "User not found",
        success: false,
      });
    }

    req.user = user; // attach user object to request
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
      success: false,
    });
  }
};

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      message: "User not admin",
      success: false,
    });
  }
  next();
};

// Middleware to check if user is SuperAdmin
const isSupperAdmin = (req, res, next) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({
      message: "User not super admin",
      success: false,
    });
  }
  next();
};

// Middleware to check if user is Tenant
const isTenant = (req, res, next) => {
  if (req.user.role !== "Tenant") {
    return res.status(403).json({
      message: "User not tenant",
      success: false,
    });
  }
  next();
};

export { userAuth, isAdmin, isSupperAdmin, isTenant };
