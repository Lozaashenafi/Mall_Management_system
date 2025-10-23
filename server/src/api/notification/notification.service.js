import prisma from "../../config/prismaClient.js";
import { io, onlineUsers } from "../../../app.js";

export const createNotification = async ({
  userId,
  tenantId,
  type,
  message,
  sentVia,
}) => {
  // Save to database
  const notification = await prisma.notification.create({
    data: {
      userId,
      tenantId,
      type,
      message,
      sentVia,
      status: "UNREAD",
    },
  });

  if (userId && onlineUsers.has(Number(userId))) {
    onlineUsers.get(Number(userId)).forEach((socketId) => {
      io.to(socketId).emit("notification", notification);
    });
  }
  return notification;
};
