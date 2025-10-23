import api from "../util/axios";

export const getNotifications = async (id) => {
  try {
    const response = await api.get(`/notifications/${id}`);
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/read/${notificationId}`);
    return response.data.notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data.message;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
