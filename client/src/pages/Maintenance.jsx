import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Maintenance() {
  const [maintenanceList, setMaintenanceList] = useState([
    // Mock data
    {
      maintenanceId: 1,
      roomId: 101,
      roomNumber: "A101",
      issue: "Air conditioner not working",
      requestDate: "2025-09-01",
      status: "Pending",
    },
    {
      maintenanceId: 2,
      roomId: 102,
      roomNumber: "B201",
      issue: "Leaking faucet",
      requestDate: "2025-09-03",
      status: "In Progress",
    },
    {
      maintenanceId: 3,
      roomId: 103,
      roomNumber: "C301",
      issue: "Broken window",
      requestDate: "2025-09-05",
      status: "Completed",
    },
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(maintenanceList.length / pageSize);
  const paginatedList = maintenanceList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (maintenanceId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this maintenance request?"
      )
    ) {
      setMaintenanceList((prev) =>
        prev.filter((m) => m.maintenanceId !== maintenanceId)
      );
    }
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Maintenance Management</h1>
        <Link
          to="/manage-maintenance/add"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" /> Add Maintenance
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Room Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Issue
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Request Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedList.map((m) => (
              <tr
                key={m.maintenanceId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{m.roomNumber}</td>
                <td className="px-4 py-2">{m.issue}</td>
                <td className="px-4 py-2">{m.requestDate}</td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2 text-right flex justify-end gap-2">
                  <Link
                    to={`/manage-maintenance/view/${m.maintenanceId}`}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Link>
                  <Link
                    to={`/manage-maintenance/edit/${m.maintenanceId}`}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(m.maintenanceId)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No maintenance requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
