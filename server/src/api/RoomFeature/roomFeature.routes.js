import express from "express";
import {
  createRoomFeature,
  getRoomFeatures,
  getRoomFeatureById,
  updateRoomFeature,
  deleteRoomFeature,
  createRoomFeatureType,
  updateRoomFeatureType,
  getRoomFeatureType,
} from "./roomFeature.controller.js";
import { userAuth, isAdmin } from "../../middleware/auth.js";

const router = express.Router();

// List all room features
router.get("/", userAuth, isAdmin, getRoomFeatures);
router.get("/type", userAuth, isAdmin, getRoomFeatureType);

// CRUD
router.post("/", userAuth, isAdmin, createRoomFeature);
router.put("/:id", userAuth, isAdmin, updateRoomFeature);
router.delete("/:id", userAuth, isAdmin, deleteRoomFeature);
// CRUD
router.post("/type/", userAuth, isAdmin, createRoomFeatureType);
router.put("/type/:id ", userAuth, isAdmin, updateRoomFeatureType);

export default router;
