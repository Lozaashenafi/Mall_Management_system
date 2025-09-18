import express from "express";
import {
  register,
  login,
  editProfile,
  changePassword,
} from "./Auth.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";
import uploadProfileImage from "../../middleware/multer.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
// Protected routes
router.put("/edit-profile", userAuth, editProfile);
router.put(
  "/change-password",
  userAuth,
  uploadProfileImage.single("profilePicture"),
  changePassword
);

export default router;
