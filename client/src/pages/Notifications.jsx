import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Users,
  Send,
  Trash2,
  Check,
} from "lucide-react"; // Added Check icon
import io from "socket.io-client";
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
} from "../services/notificationService.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const SOCKET_URL = "http://localhost:3300";
  const API_URL = `${SOCKET_URL}/api/notifications`;

  const fetchNotifications = async (id) => {
    try {
      const notification = await getNotifications(id);
      setNotifications(notification);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.userId) {
      socket.emit("register", storedUser.userId);
    }

    socket.on("notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    socket.on("newNotification", (data) => {
      const newNotif = {
        id: Date.now().toString(),
        type: data.type,
        message: data.message,
        sentVia: data.sentVia,
        status: "UNREAD",
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    fetchNotifications(storedUser?.userId);
    return () => socket.disconnect();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case "UNREAD":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "READ":
      case "SENT":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Invoice":
        return <FileText className="w-4 h-4" />;
      case "PaymentReminder":
        return <CreditCard className="w-4 h-4" />;
      case "RenewalReminder":
        return <RefreshCw className="w-4 h-4" />;
      case "SystemAlert":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleDelete = (id) => {
    // Call your service to delete notification in backend
    deleteNotification(id);
    setNotifications((prev) =>
      prev.filter((n) => n.notificationId !== id && n.id !== id)
    );
  };
  const handleMarkAsRead = async (notification) => {
    try {
      // Call your service to update status in backend
      await markNotificationAsRead(
        notification.notificationId || notification.id
      );

      // Update local state to mark as read
      setNotifications((prev) =>
        prev.map((n) =>
          (n.notificationId || n.id) ===
          (notification.notificationId || notification.id)
            ? { ...n, status: "READ" }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all system notifications
          </p>
        </div>
        <button
          onClick={() => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            fetchNotifications(storedUser?.userId);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          <Send className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1">Recent Notifications</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Real-time system and tenant alerts
            </p>
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500">No notifications yet</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div
                    key={n.notificationId || n.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
                        {getTypeIcon(n.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{n.type}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {n.tenant?.companyName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {n.tenant.companyName}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                          n.status
                        )}`}
                      >
                        {n.status}
                      </span>

                      {/* Mark as Read Icon */}
                      {n.status !== "READ" && (
                        <button
                          onClick={() => handleMarkAsRead(n)}
                          className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDelete(n.notificationId || n.id)}
                        className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
