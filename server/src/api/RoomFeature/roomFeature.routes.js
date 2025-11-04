import express from "express";
import {
  createRoomFeature,
  getRoomFeatures,
  updateRoomFeature,
  deleteRoomFeature,
  createRoomFeatureType,
  updateRoomFeatureType,
  getRoomFeatureType,
  deleteRoomFeatureType,
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
router.post("/type", userAuth, isAdmin, createRoomFeatureType);
router.put("/type/:id", userAuth, isAdmin, updateRoomFeatureType);
router.delete("/type/:id", userAuth, isAdmin, deleteRoomFeatureType);

export default router;
