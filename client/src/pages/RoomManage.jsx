import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RoomManage() {
  const [rooms, setRooms] = useState([
    // Mock data (replace with API fetch)
    {
      roomId: 1,
      unitNumber: "101",
      floor: 1,
      size: 35.5,
      roomType: { name: "Single" },
      status: "Vacant",
    },
    {
      roomId: 2,
      unitNumber: "102",
      floor: 1,
      size: 45,
      roomType: { name: "Double" },
      status: "Occupied",
    },
    {
      roomId: 3,
      unitNumber: "201",
      floor: 2,
      size: 40,
      roomType: { name: "Single" },
      status: "Vacant",
    },
    {
      roomId: 4,
      unitNumber: "202",
      floor: 2,
      size: 50,
      roomType: { name: "Double" },
      status: "Occupied",
    },
    {
      roomId: 5,
      unitNumber: "301",
      floor: 3,
      size: 30,
      roomType: { name: "Single" },
      status: "Vacant",
    },
    {
      roomId: 6,
      unitNumber: "302",
      floor: 3,
      size: 55,
      roomType: { name: "Suite" },
      status: "Occupied",
    },
    // Add more mock rooms if needed
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // rooms per page

  const totalPages = Math.ceil(rooms.length / pageSize);
  const paginatedRooms = rooms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      setRooms((prev) => prev.filter((room) => room.roomId !== roomId));
    }
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Link
          to="/manage-rooms/add"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" /> Add Room
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Unit Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Floor
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Size (sqm)
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Room Type
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
            {paginatedRooms.map((room) => (
              <tr
                key={room.roomId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{room.unitNumber}</td>
                <td className="px-4 py-2">{room.floor}</td>
                <td className="px-4 py-2">{room.size}</td>
                <td className="px-4 py-2">{room.roomType.name}</td>
                <td className="px-4 py-2">{room.status}</td>
                <td className="px-4 py-2 text-right flex justify-end gap-2">
                  <Link
                    to={`/manage-rooms/view/${room.roomId}`}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Link>
                  <Link
                    to={`/manage-rooms/edit/${room.roomId}`}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(room.roomId)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedRooms.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  No rooms found.
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
