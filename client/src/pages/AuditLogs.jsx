import { useState } from "react";
import {
  FileText, // Represents an audit log entry
  User, // For the user who performed the action
  HardDrive, // For the table name
  Tag, // For recordId
  Edit3, // For 'updated' action
  PlusCircle, // For 'created' action
  MinusCircle,
  Settings, // For 'deleted' action
} from "lucide-react";

// Mock audit logs based on your schema
const mockAuditLogs = [
  {
    logId: 1,
    userId: 101,
    userFullName: "Alice Johnson", // Added for display purposes
    action: "created",
    tableName: "Tenant",
    recordId: 1,
    oldValue: null,
    newValue: { companyName: "New Tech Co.", contactPerson: "John Doe" },
    timestamp: "2023-10-26T14:30:00Z",
  },
  {
    logId: 2,
    userId: 102,
    userFullName: "Bob Williams",
    action: "updated",
    tableName: "Room",
    recordId: 5,
    oldValue: { status: "Vacant" },
    newValue: { status: "Occupied" },
    timestamp: "2023-10-26T15:00:00Z",
  },
  {
    logId: 3,
    userId: 101,
    userFullName: "Alice Johnson",
    action: "deleted",
    tableName: "Agreement",
    recordId: 12,
    oldValue: { agreementId: 12, tenantId: 3, roomId: 7 },
    newValue: null,
    timestamp: "2023-10-26T15:45:00Z",
  },
  {
    logId: 4,
    userId: 103,
    userFullName: "Charlie Brown",
    action: "created",
    tableName: "User",
    recordId: 104,
    oldValue: null,
    newValue: { fullName: "New Admin User", role: "Admin" },
    timestamp: "2023-10-26T16:00:00Z",
  },
  {
    logId: 5,
    userId: 102,
    userFullName: "Bob Williams",
    action: "updated",
    tableName: "Invoice",
    recordId: 23,
    oldValue: { status: "Unpaid", totalAmount: 1200.0 },
    newValue: { status: "Paid", totalAmount: 1200.0 },
    timestamp: "2023-10-26T16:15:00Z",
  },
];

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);

  const getActionColor = (action) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return <PlusCircle className="w-4 h-4" />;
      case "updated":
        return <Edit3 className="w-4 h-4" />;
      case "deleted":
        return <MinusCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all system actions and changes made by users
          </p>
        </div>
        {/* You might not have a "New Audit Log" button, but for consistency,
            I'll leave a placeholder or suggest a filter/export button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
          {/* <Download className="w-4 h-4" /> */}
          Export Logs
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1">Recent Audit Logs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Detailed history of user activities and system modifications
            </p>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log.logId}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">
                        {log.action}d {log.tableName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Record ID: {log.recordId}
                        {log.action === "updated" &&
                          log.oldValue &&
                          log.newValue && (
                            <>
                              <br />
                              <span className="italic">
                                Changed from: {JSON.stringify(log.oldValue)} to{" "}
                                {JSON.stringify(log.newValue)}
                              </span>
                            </>
                          )}
                        {log.action === "created" && log.newValue && (
                          <>
                            <br />
                            <span className="italic">
                              New value: {JSON.stringify(log.newValue)}
                            </span>
                          </>
                        )}
                        {log.action === "deleted" && log.oldValue && (
                          <>
                            <br />
                            <span className="italic">
                              Deleted value: {JSON.stringify(log.oldValue)}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.userFullName} (ID: {log.userId})
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleDateString()} at{" "}
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    {/* You might not have direct "View" or "Delete" actions on individual logs in a production audit log,
                        but for consistency, I'll add a "Details" button. Deleting logs is generally not advised. */}
                    <div className="flex gap-1">
                      <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        Details
                      </button>
                      {/* <button
                        onClick={() =>
                          setAuditLogs((prev) =>
                            prev.filter((item) => item.logId !== log.logId)
                          )
                        }
                        className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audit Log Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Logs
                </span>
                <span className="font-medium">{auditLogs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Creations
                </span>
                <span className="font-medium">
                  {auditLogs.filter((log) => log.action === "created").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Updates
                </span>
                <span className="font-medium">
                  {auditLogs.filter((log) => log.action === "updated").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Deletions
                </span>
                <span className="font-medium">
                  {auditLogs.filter((log) => log.action === "deleted").length}
                </span>
              </div>
            </div>
          </div>

          {/* Filters or Settings for Logs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Log Filters
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Filter audit logs by action, user, or table
            </p>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="actionFilter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Action Type
                </label>
                <select
                  id="actionFilter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="userFilter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  User
                </label>
                <input
                  type="text"
                  id="userFilter"
                  placeholder="Filter by user name or ID"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="tableFilter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Table
                </label>
                <input
                  type="text"
                  id="tableFilter"
                  placeholder="Filter by table name"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
