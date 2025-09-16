import { useState } from "react";
import {
  Bell,
  FileText,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Users,
  Settings,
  Trash2,
  Send,
} from "lucide-react";

// Mock notifications for mall management system
const mockNotifications = [
  {
    id: "1",
    type: "Invoice",
    message: "Invoice #INV-1001 has been generated for Tenant ABC Corp.",
    sentVia: "System",
    status: "sent",
    tenant: "ABC Corp",
    createdAt: "2025-08-12T10:00:00Z",
  },
  {
    id: "2",
    type: "PaymentReminder",
    message: "Payment for Invoice #INV-1002 is due tomorrow.",
    sentVia: "Email",
    status: "pending",
    tenant: "XYZ Ltd",
    createdAt: "2025-08-14T09:30:00Z",
  },
  {
    id: "3",
    type: "RenewalReminder",
    message: "Lease Agreement #AG-2005 will expire in 30 days.",
    sentVia: "SMS",
    status: "draft",
    tenant: "Delta Holdings",
    createdAt: "2025-08-20T12:15:00Z",
  },
  {
    id: "4",
    type: "SystemAlert",
    message: "Server maintenance scheduled for 16th Sept, 10:00 PM.",
    sentVia: "System",
    status: "sent",
    tenant: null,
    createdAt: "2025-08-25T08:00:00Z",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
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

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage system alerts, payment reminders, and tenant notifications
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
          <Send className="w-4 h-4" />
          New Notification
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Notifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1">Recent Notifications</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Track system and tenant-related notifications
            </p>
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      {getTypeIcon(n.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{n.type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        {n.tenant && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {n.tenant}
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
                    <div className="flex gap-1">
                      <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        View
                      </button>
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((item) => item.id !== n.id)
                          )
                        }
                        className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notification Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sent
                </span>
                <span className="font-medium">128</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </span>
                <span className="font-medium">4</span>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Notification Channels
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure how notifications are sent
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Email</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>SMS</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span>System Alerts</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
