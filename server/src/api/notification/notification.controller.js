import prisma from "../../config/prismaClient.js";

export const getAllNotifications = async (req, res) => {
  const { id } = req.params;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: Number(id),
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params; // notificationId
  try {
    const updated = await prisma.notification.update({
      where: { notificationId: Number(id) },
      data: { status: "READ" },
    });
    res.status(200).json({ notification: updated });
  } catch (error) {
    console.error("Error updating notification status:", error);
    res
      .status(500)
      .json({ message: "Failed to update notification", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params; // notificationId
  try {
    await prisma.notification.delete({
      where: { notificationId: Number(id) },
    });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ message: "Failed to delete notification", error: error.message });
  }
};

export default { getAllNotifications, markAsRead };
