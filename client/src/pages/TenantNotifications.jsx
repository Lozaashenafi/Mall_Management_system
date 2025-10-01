import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Mail } from "lucide-react";

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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Rent Due Reminder",
      message: "Your rent is due on Oct 5.",
      type: "warning",
      date: "2025-09-28",
      read: false,
    },
    {
      id: 2,
      title: "Payment Received",
      message: "We have received your payment for September.",
      type: "success",
      date: "2025-09-05",
      read: true,
    },
    {
      id: 3,
      title: "Maintenance Update",
      message: "Your AC repair request is now in progress.",
      type: "info",
      date: "2025-09-20",
      read: false,
    },
    {
      id: 4,
      title: "New Announcement",
      message: "Fire drill scheduled for next week.",
      type: "info",
      date: "2025-09-25",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
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
              key={n.id}
              className={`flex items-start justify-between p-4 transition ${
                n.read
                  ? "bg-gray-50 dark:bg-gray-800/50"
                  : "bg-purple-50 dark:bg-purple-900/30"
              }`}
            >
              <div className="flex items-start space-x-3">
                {getIcon(n.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {n.date}
                  </span>
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
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
