import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Bell,
  AlertTriangle,
  Shield,
  Camera,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import { BASE_URL } from "../../config";

// Reusable StatsCard for Security
const SecurityStatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between mb-2">
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    CRITICAL: {
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      label: "CRITICAL",
    },
    HIGH: {
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      label: "HIGH",
    },
    MEDIUM: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      label: "MEDIUM",
    },
    LOW: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      label: "LOW",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.LOW;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// Action Buttons Component
const SecurityActionButtons = ({
  incidentId,
  currentStatus,
  onStatusUpdate,
}) => {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      //   await updateIncidentStatus(incidentId, newStatus);
      //   onStatusUpdate(incidentId, newStatus);
    } catch (error) {
      console.error("Failed to update incident status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {currentStatus === "PENDING" && (
        <>
          <button
            onClick={() => handleStatusUpdate("IN_PROGRESS")}
            disabled={loading}
            className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Acknowledge"}
          </button>
          <button
            onClick={() => handleStatusUpdate("FALSE_ALARM")}
            disabled={loading}
            className="px-3 py-1 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            False Alarm
          </button>
        </>
      )}
      {currentStatus === "IN_PROGRESS" && (
        <button
          onClick={() => handleStatusUpdate("RESOLVED")}
          disabled={loading}
          className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Mark Resolved"}
        </button>
      )}
    </div>
  );
};

const SecurityOfficerNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    todayIncidents: 0,
    criticalAlerts: 0,
    resolvedToday: 0,
  });

  // Fetch security notifications and stats
  const fetchSecurityData = async () => {
    if (!user?.userId) return;
    try {
      const data = await getNotifications(user.userId);
      setNotifications(data.notifications || []);
      setStats(
        data.stats || {
          activeIncidents: 0,
          todayIncidents: 0,
          criticalAlerts: 0,
          resolvedToday: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch security data:", err);
    }
  };

  // Connect to Socket.IO for real-time security updates
  useEffect(() => {
    if (!user?.userId) return;

    const socket = io(BASE_URL, { transports: ["websocket"] });
    socket.emit("registerSecurity", user.userId);

    // Listen for security-specific events
    socket.on("securityAlert", (alert) => {
      const newNotification = {
        id: `security-${Date.now()}`,
        type: "SECURITY_ALERT",
        priority: alert.priority || "MEDIUM",
        title: alert.title,
        message: alert.message,
        location: alert.location,
        cameraId: alert.cameraId,
        status: "PENDING",
        incidentType: alert.incidentType || "GENERAL",
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      // Update stats
      setStats((prev) => ({
        ...prev,
        activeIncidents: prev.activeIncidents + 1,
        todayIncidents: prev.todayIncidents + 1,
        criticalAlerts:
          alert.priority === "CRITICAL"
            ? prev.criticalAlerts + 1
            : prev.criticalAlerts,
      }));
    });

    socket.on("incidentUpdate", (update) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.incidentId === update.incidentId
            ? {
                ...n,
                status: update.status,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      );

      // Update stats based on incident status change
      if (update.status === "RESOLVED") {
        setStats((prev) => ({
          ...prev,
          activeIncidents: Math.max(0, prev.activeIncidents - 1),
          resolvedToday: prev.resolvedToday + 1,
        }));
      }
    });

    fetchSecurityData();

    return () => socket.disconnect();
  }, [user]);

  const activeIncidents = notifications.filter(
    (n) => n.status === "PENDING" || n.status === "IN_PROGRESS"
  ).length;

  const criticalIncidents = notifications.filter(
    (n) =>
      n.priority === "CRITICAL" &&
      (n.status === "PENDING" || n.status === "IN_PROGRESS")
  ).length;

  // Mark notification as read
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

  // Handle incident status update
  const handleIncidentStatusUpdate = (incidentId, newStatus) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.incidentId === incidentId
          ? { ...n, status: newStatus, updatedAt: new Date().toISOString() }
          : n
      )
    );

    // Update stats
    if (newStatus === "RESOLVED") {
      setStats((prev) => ({
        ...prev,
        activeIncidents: Math.max(0, prev.activeIncidents - 1),
        resolvedToday: prev.resolvedToday + 1,
      }));
    }
  };

  // Get appropriate icon for incident type
  const getIncidentIcon = (incidentType) => {
    switch (incidentType) {
      case "INTRUSION":
        return <Shield className="w-5 h-5 text-red-500" />;
      case "SUSPICIOUS_ACTIVITY":
        return <Users className="w-5 h-5 text-orange-500" />;
      case "CAMERA_ALERT":
        return <Camera className="w-5 h-5 text-blue-500" />;
      case "ACCESS_VIOLATION":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Security Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and respond to security incidents in real-time.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchSecurityData()}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              // Export incidents logic here
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
          >
            Export Logs
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityStatsCard
          title="Active Incidents"
          value={stats.activeIncidents}
          description="Requiring attention"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <SecurityStatsCard
          title="Today's Incidents"
          value={stats.todayIncidents}
          description="Total reported today"
          icon={Bell}
          color="bg-orange-500"
        />
        <SecurityStatsCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          description="High priority incidents"
          icon={Shield}
          color="bg-red-600"
        />
        <SecurityStatsCard
          title="Resolved Today"
          value={stats.resolvedToday}
          description="Successfully handled"
          icon={CheckCircle}
          color="bg-green-500"
        />
      </div>

      {/* Active Incidents Section */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Incidents ({activeIncidents})
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {criticalIncidents} critical
            </span>
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {notifications
            .filter((n) => n.status === "PENDING" || n.status === "IN_PROGRESS")
            .sort((a, b) => {
              // Sort by priority first, then by time
              const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
              return (
                priorityOrder[a.priority] - priorityOrder[b.priority] ||
                new Date(b.createdAt) - new Date(a.createdAt)
              );
            })
            .map((notification) => (
              <div
                key={notification.notificationId || notification.id}
                className={`p-4 rounded-lg border ${
                  notification.priority === "CRITICAL"
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                    : notification.priority === "HIGH"
                    ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIncidentIcon(notification.incidentType)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </h3>
                        <PriorityBadge priority={notification.priority} />
                        {notification.status === "IN_PROGRESS" && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {notification.location && (
                          <span className="flex items-center">
                            📍 {notification.location}
                          </span>
                        )}
                        {notification.cameraId && (
                          <span className="flex items-center">
                            📹 Camera {notification.cameraId}
                          </span>
                        )}
                        <span>⏱️ {formatTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {notification.status !== "READ" && (
                      <button
                        onClick={() =>
                          markAsRead(
                            notification.notificationId || notification.id
                          )
                        }
                        className="px-3 py-1 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700"
                      >
                        Mark Read
                      </button>
                    )}
                    <SecurityActionButtons
                      incidentId={
                        notification.notificationId || notification.id
                      }
                      currentStatus={notification.status}
                      onStatusUpdate={handleIncidentStatusUpdate}
                    />
                  </div>
                </div>
              </div>
            ))}

          {activeIncidents === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active incidents. All clear.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Activity Log
        </h2>
        <div className="space-y-3">
          {notifications
            .filter(
              (n) =>
                n.status === "READ" ||
                n.status === "RESOLVED" ||
                n.status === "FALSE_ALARM"
            )
            .slice(0, 10)
            .map((notification) => (
              <div
                key={notification.notificationId || notification.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getIncidentIcon(notification.incidentType)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.location} •{" "}
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      notification.status === "RESOLVED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                        : notification.status === "FALSE_ALARM"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30"
                    }`}
                  >
                    {notification.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityOfficerNotifications;
