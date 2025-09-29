import { useState, useEffect } from "react";
import { FileText, User, Edit3, PlusCircle, MinusCircle } from "lucide-react";
import { getRecentAuditLogs } from "../services/auditService";

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    table: "",
  });
  const [searchText, setSearchText] = useState("");

  // Fetch audit logs from API
  const fetchAuditLogs = async () => {
    try {
      const response = await getRecentAuditLogs();
      setAuditLogs(response);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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

  const getChanges = (oldValue, newValue) => {
    if (!oldValue || !newValue) return null;
    const changes = [];

    Object.keys(newValue).forEach((key) => {
      if (key === "updatedAt") return; // skip updatedAt

      const oldVal = oldValue[key];
      const newVal = newValue[key];

      if (typeof newVal === "object" && newVal !== null) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          if (key.toLowerCase().includes("roomtype") && newVal.typeName) {
            changes.push({
              field: key,
              from: oldVal?.typeName || "[Object]",
              to: newVal.typeName,
            });
          } else if (
            key.toLowerCase().includes("tenant") &&
            newVal.companyName
          ) {
            changes.push({
              field: key,
              from: oldVal?.companyName || "[Object]",
              to: `${newVal.companyName} (${newVal.contactPerson})`,
            });
          } else {
            changes.push({
              field: key,
              from: "[Object]",
              to: "[Object]",
            });
          }
        }
      } else {
        if (oldVal !== newVal) {
          changes.push({ field: key, from: oldVal, to: newVal });
        }
      }
    });

    return changes;
  };

  const getRecordSummary = (log) => {
    if (!log.newValue && !log.oldValue) return "";

    if (log.tableName.toLowerCase() === "tenant") {
      const name = log.newValue?.companyName || log.oldValue?.companyName || "";
      const person =
        log.newValue?.contactPerson || log.oldValue?.contactPerson || "";
      return `Tenant "${name}" (${person})`;
    }
    if (log.tableName.toLowerCase() === "room") {
      const roomNumber =
        log.newValue?.unitNumber || log.oldValue?.unitNumber || "";
      const floor = log.newValue?.floor || log.oldValue?.floor || "";
      return `Room ${roomNumber} on Floor ${floor}`;
    }
    if (log.tableName.toLowerCase() === "user") {
      const fullName =
        log.newValue?.fullName || log.oldValue?.fullName || "Unknown User";
      return `User "${fullName}"`;
    }

    const identifier =
      log.newValue?.id || log.oldValue?.id || log.recordId || "record";
    return `${log.tableName} (${identifier})`;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filters.action ? log.action === filters.action : true;
    const matchesUser = filters.user
      ? log.userFullName.toLowerCase().includes(filters.user.toLowerCase())
      : true;
    const matchesTable = filters.table
      ? log.tableName.toLowerCase().includes(filters.table.toLowerCase())
      : true;
    const matchesSearch = searchText
      ? JSON.stringify(log).toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesAction && matchesUser && matchesTable && matchesSearch;
  });

  if (loading) return <p>Loading audit logs...</p>;

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          className="border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
        </select>
        <input
          type="text"
          name="user"
          placeholder="Filter by User"
          value={filters.user}
          onChange={handleFilterChange}
          className="px-2 py-1 border rounded"
        />
        <input
          type="text"
          name="table"
          placeholder="Filter by Table"
          value={filters.table}
          onChange={handleFilterChange}
          className="px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-2 py-1 border rounded flex-1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-1">Recent Audit Logs</h2>
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const changes = getChanges(log.oldValue, log.newValue);
                return (
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
                          {log.action} {log.tableName}
                        </h3>

                        {changes && changes.length > 0 && (
                          <ul className="text-sm mt-2 space-y-1">
                            {changes.map((change) => (
                              <li key={change.field} className="italic">
                                <span className="font-semibold">
                                  {change.field}:
                                </span>{" "}
                                {JSON.stringify(change.from)} →{" "}
                                {JSON.stringify(change.to)}
                              </li>
                            ))}
                          </ul>
                        )}

                        {log.action === "created" && log.newValue && (
                          <p className="italic text-sm mt-2 text-green-600">
                            Created: {getRecordSummary(log)}
                          </p>
                        )}
                        {log.action === "deleted" && log.oldValue && (
                          <p className="italic text-sm mt-2 text-red-600">
                            Deleted: {getRecordSummary(log)}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3" /> {log.userFullName}
                          <span>
                            {new Date(log.timestamp).toLocaleDateString()} at{" "}
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Logs</span>
                <span>{auditLogs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Creations</span>
                <span>
                  {auditLogs.filter((l) => l.action === "created").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Updates</span>
                <span>
                  {auditLogs.filter((l) => l.action === "updated").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Deletions</span>
                <span>
                  {auditLogs.filter((l) => l.action === "deleted").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
