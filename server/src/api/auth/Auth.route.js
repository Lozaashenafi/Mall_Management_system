import express from "express";
import {
  register,
  login,
  editProfile,
  changePassword,
  getAllUsers,
  deleteUserRequest,
} from "./Auth.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

// Public routes
router.post("/register", userAuth, isAdmin, register);
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
router.delete("/:userId", userAuth, isAdmin, deleteUserRequest);

export default router;
