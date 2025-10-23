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

  // Emit via Socket.IO if the recipient is online
  if (userId && onlineUsers.has(userId)) {
    io.to(onlineUsers.get(userId)).emit("notification", notification);
  }

  return notification;
};
