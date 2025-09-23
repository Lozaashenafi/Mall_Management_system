import prisma from "../../config/prismaClient.js";
import roomSchema from "./Room.schema.js";

export const addRoom = async (req, res) => {
  try {
    // Validate request body
    const { error } = roomSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { unitNumber } = req.body;

    // Check if unitNumber already exists (MySQL is case-insensitive by default)
    const existingRoom = await prisma.room.findFirst({
      where: { unitNumber: unitNumber }, // plain equality
    });

    if (existingRoom) {
      return res.status(400).json({
        message: `Room with unit number "${unitNumber}" already exists`,
      });
    }

    // Create room
    const room = await prisma.room.create({
      data: req.body,
      include: { roomType: true }, // include related RoomType
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
      where: { status: { not: "Inactive" } }, // exclude Inactive rooms
      include: { roomType: true, rental: true, maintenance: true },
    });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
      include: { roomType: true, rental: true, maintenance: true },
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

    // 🔍 Check if unitNumber already exists (ignore case, exclude this room itself)
    if (unitNumber) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          unitNumber: unitNumber,
          NOT: { roomId: Number(id) }, // exclude the room being updated
        },
      });

      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Unit number already exists (case-insensitive).",
        });
      }
    }

    // ✅ Perform update
    const room = await prisma.room.update({
      where: { roomId: Number(id) },
      data: {
        ...(unitNumber && { unitNumber }),
        ...rest,
      },
      include: { roomType: true },
    });

    res.json({ success: true, message: "Room updated", room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Find the room
    const room = await prisma.room.findUnique({
      where: { roomId: Number(id) },
    });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // 🚫 If Occupied → don't delete
    if (room.status === "Occupied") {
      return res.status(400).json({
        success: false,
        message: "You can't delete an occupied room",
      });
    }

    // ✅ Otherwise → deactivate (soft delete)
    const updatedRoom = await prisma.room.update({
      where: { roomId: Number(id) },
      data: { status: "Inactive" },
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
