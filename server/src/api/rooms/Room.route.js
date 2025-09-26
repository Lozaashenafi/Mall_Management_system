import express from "express";
import {
  addRoom,
  getRooms,
  getRoomById,
  getRoomType,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} from "./Room.controller.js";
import { isAdmin, userAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", userAuth, isAdmin, addRoom);
router.get("/types", userAuth, isAdmin, getRoomType);
router.get("/vacant", userAuth, isAdmin, getAvailableRooms);
router.get("/", userAuth, isAdmin, getRooms);
router.get("/:id", userAuth, isAdmin, getRoomById);
router.put("/:id", userAuth, isAdmin, updateRoom);
router.delete("/:id", userAuth, isAdmin, deleteRoom);

export default router;
