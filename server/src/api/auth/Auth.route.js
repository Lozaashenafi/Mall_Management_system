import express from "express";
import {
  register,
  login,
  editProfile,
  changePassword,
  getAllUsers,
} from "./Auth.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import upload from "../../middleware/multer.js";
import { get } from "http";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
// Protected routes
router.put(
  "/edit-profile",
  userAuth,
  upload.single("profilePicture"),
  editProfile
);
router.put("/change-password", userAuth, changePassword);
router.get("/all-users", userAuth, isAdmin, getAllUsers);

export default router;
