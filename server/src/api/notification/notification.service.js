import prisma from "../../config/prismaClient.js";

export const createNotification = async (data) => {
  try {
    const { tenantId, type, message, sentVia } = data;

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        type,
        message,
        sentVia,
      },
    });

    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error.message);
    throw error;
  }
};
