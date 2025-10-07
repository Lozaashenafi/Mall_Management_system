import prisma from "../../config/prismaClient.js";
import roomSchema from "./Room.schema.js";
import { createAuditLog } from "../../utils/audit.js";

// ✅ Add Room
export const addRoom = async (req, res) => {
  try {
    const { error } = roomSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { unitNumber } = req.body;

    const existingRoom = await prisma.room.findFirst({ where: { unitNumber } });
    if (existingRoom) {
      return res.status(400).json({
        message: `Room with unit number "${unitNumber}" already exists`,
      });
    }

    const room = await prisma.room.create({
      data: {
        unitNumber: req.body.unitNumber,
        floor: req.body.floor,
        size: req.body.size,
        roomTypeId: req.body.roomTypeId,
        status: req.body.status || "Vacant",
        hasParking: req.body.hasParking ?? false,
        parkingType: req.body.parkingType || null,
        parkingSpaces:
          req.body.parkingType === "Limited"
            ? req.body.parkingSpaces ?? 0
            : null,
      },
      include: { roomType: true },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "created",
      tableName: "Room",
      recordId: room.roomId,
      newValue: room,
    });

    res.status(201).json({ success: true, message: "Room created", room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { status: { not: "Inactive" } },
      include: {
        roomType: true,
        rental: true,
        maintenance: true,
        roomFeatures: true,
      },
    });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Room Types
export const getRoomType = async (req, res) => {
  try {
    const roomTypes = await prisma.roomType.findMany();
    res.json({ success: true, roomTypes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { roomId: Number(id) },
      include: {
        roomType: true,
        rental: true,
        maintenance: true,
        roomFeatures: true,
      },
    });

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Room
export const updateRoom = async (req, res) => {
  try {
    const { error } = roomSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const { unitNumber, ...rest } = req.body;

    const room = await prisma.room.findUnique({
      where: { roomId: Number(id) },
    });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (unitNumber) {
      const existingRoom = await prisma.room.findFirst({
        where: { unitNumber, NOT: { roomId: Number(id) } },
      });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Unit number already exists (case-insensitive).",
        });
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { roomId: Number(id) },
      data: {
        ...(unitNumber && { unitNumber }),
        ...rest,
        parkingSpaces:
          req.body.parkingType === "Limited"
            ? req.body.parkingSpaces ?? 0
            : null,
      },
      include: { roomType: true },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "updated",
      tableName: "Room",
      recordId: updatedRoom.roomId,
      oldValue: room,
      newValue: updatedRoom,
    });

    res.json({ success: true, message: "Room updated", room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Room (soft delete)
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { roomId: Number(id) },
    });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    if (room.status === "Occupied") {
      return res.status(400).json({
        success: false,
        message: "You can't delete an occupied room",
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { roomId: Number(id) },
      data: { status: "Inactive" },
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "deleted",
      tableName: "Room",
      recordId: updatedRoom.roomId,
      oldValue: room,
      newValue: updatedRoom,
    });

    res.json({
      success: true,
      message: "Room deactivated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Available Rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const availableRooms = await prisma.room.findMany({
      where: { status: "Vacant" },
      include: { roomType: true },
    });
    res.json({ success: true, rooms: availableRooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
