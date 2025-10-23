import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Bell, CheckCircle, AlertTriangle, Info, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

// Reusable StatsCard
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const TenantNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const SOCKET_URL = "http://localhost:3300";

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      const data = await getNotifications(user.userId);
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Connect to Socket.IO for real-time updates
  useEffect(() => {
    if (!user?.userId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.emit("register", user.userId); // register tenant user on socket

    // Listen for incoming notifications
    socket.on("notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    // Optional: Listen for another type if your backend emits different events
    socket.on("newNotification", (data) => {
      const newNotif = {
        id: Date.now().toString(),
        type: data.type || "info",
        title: data.title || "New Notification",
        message: data.message,
        status: "UNREAD",
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    fetchNotifications();

    return () => socket.disconnect();
  }, [user]);

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id || n.id === id ? { ...n, status: "READ" } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          n.status === "UNREAD"
            ? markNotificationAsRead(n.notificationId || n.id)
            : null
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your latest alerts and messages.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Mark All as Read
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Unread Notifications"
          value={unreadCount}
          icon={Bell}
          color="bg-red-500"
        />
        <StatsCard
          title="Total Notifications"
          value={notifications.length}
          icon={Mail}
          color="bg-purple-500"
        />
      </div>

      {/* Notification List */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Notifications
        </h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((n) => (
            <li
              key={n.notificationId || n.id}
              className={`flex items-start justify-between p-4 transition ${
                n.status === "READ"
                  ? "bg-gray-50 dark:bg-gray-800/50"
                  : "bg-purple-50 dark:bg-purple-900/30"
              }`}
            >
              <div className="flex items-start space-x-3">
                {getIcon(n.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {n.title || n.type || "Notification"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {n.status !== "READ" && (
                <button
                  onClick={() => markAsRead(n.notificationId || n.id)}
                  className="ml-4 px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Mark Read
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TenantNotifications;
