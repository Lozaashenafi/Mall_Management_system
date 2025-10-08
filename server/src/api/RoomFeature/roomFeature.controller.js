import prisma from "../../config/prismaClient.js";
import roomFeatureSchema from "./roomFeature.schema.js";
import { createAuditLog } from "../../utils/audit.js";

export const createRoomFeature = async (req, res) => {
  try {
    const { error, value } = roomFeatureSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { roomId, featureTypeId, count } = value;

    // Validate room
    const room = await prisma.room.findUnique({ where: { roomId } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Validate feature type
    const featureType = await prisma.roomFeatureType.findUnique({
      where: { featureTypeId },
    });
    if (!featureType)
      return res.status(404).json({ message: "Feature type not found" });

    // Prevent duplicates
    const existing = await prisma.roomFeature.findUnique({
      where: { roomId_featureTypeId: { roomId, featureTypeId } },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Feature already assigned to this room" });

    const roomFeature = await prisma.roomFeature.create({
      data: { roomId, featureTypeId, count },
    });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "RoomFeature",
      recordId: roomFeature.roomFeatureId,
      newValue: roomFeature,
    });

    res.status(201).json({ success: true, roomFeature });
  } catch (err) {
    console.error("createRoomFeature error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createRoomFeatureType = async (req, res) => {
  try {
    const { error, value } = roomFeatureSchema.featureTypeCreate.validate(
      req.body
    );
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Prevent duplicate feature type name
    const existing = await prisma.roomFeatureType.findUnique({
      where: { name: value.name },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Feature type name already exists" });

    const featureType = await prisma.roomFeatureType.create({
      data: value,
    });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "RoomFeatureType",
      recordId: featureType.featureTypeId,
      newValue: featureType,
    });

    res.status(201).json({ success: true, featureType });
  } catch (err) {
    console.error("createRoomFeatureType error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getRoomFeatures = async (req, res) => {
  try {
    const roomFeatures = await prisma.roomFeature.findMany({
      include: {
        room: true,
        featureType: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, roomFeatures });
  } catch (err) {
    console.error("getRoomFeatures error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getRoomFeatureType = async (req, res) => {
  try {
    const featureTypes = await prisma.roomFeatureType.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, featureTypes });
  } catch (err) {
    console.error("getRoomFeatureType error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getRoomFeatureById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomFeature = await prisma.roomFeature.findUnique({
      where: { roomFeatureId: Number(id) },
      include: { room: true, featureType: true },
    });
    if (!roomFeature)
      return res.status(404).json({ message: "RoomFeature not found" });
    res.json({ success: true, roomFeature });
  } catch (err) {
    console.error("getRoomFeatureById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateRoomFeature = async (req, res) => {
  try {
    const { error, value } = roomFeatureSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.roomFeature.findUnique({
      where: { roomFeatureId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "RoomFeature not found" });

    const updated = await prisma.roomFeature.update({
      where: { roomFeatureId: Number(id) },
      data: value,
    });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "RoomFeature",
      recordId: updated.roomFeatureId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, roomFeature: updated });
  } catch (err) {
    console.error("updateRoomFeature error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const updateRoomFeatureType = async (req, res) => {
  try {
    const { error, value } = roomFeatureSchema.featureTypeUpdate.validate(
      req.body
    );
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await prisma.roomFeatureType.findUnique({
      where: { featureTypeId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "Feature type not found" });

    // Prevent duplicate name if changed
    if (value.name && value.name !== existing.name) {
      const duplicate = await prisma.roomFeatureType.findUnique({
        where: { name: value.name },
      });
      if (duplicate)
        return res
          .status(400)
          .json({ message: "Feature type name already exists" });
    }

    const updated = await prisma.roomFeatureType.update({
      where: { featureTypeId: Number(id) },
      data: value,
    });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "RoomFeatureType",
      recordId: updated.featureTypeId,
      oldValue: existing,
      newValue: updated,
    });

    res.json({ success: true, featureType: updated });
  } catch (err) {
    console.error("updateRoomFeatureType error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteRoomFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.roomFeature.findUnique({
      where: { roomFeatureId: Number(id) },
    });
    if (!existing)
      return res.status(404).json({ message: "RoomFeature not found" });

    await prisma.roomFeature.delete({ where: { roomFeatureId: Number(id) } });

    // Audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "RoomFeature",
      recordId: existing.roomFeatureId,
      oldValue: existing,
    });

    res.json({ success: true, message: "RoomFeature deleted" });
  } catch (err) {
    console.error("deleteRoomFeature error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
