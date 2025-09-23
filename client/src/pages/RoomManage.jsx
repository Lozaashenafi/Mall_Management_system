import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getRooms, deleteRoom, updateRoom } from "../services/roomService";
import { toast } from "react-hot-toast";

export default function RoomManage() {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const [isEditing, setIsEditing] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // ✅ Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(Array.isArray(data.rooms) ? data.rooms : data || []);
      } catch (error) {
        toast.error(error.message || "Failed to fetch rooms");
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  const totalPages = Math.ceil(rooms.length / pageSize);
  const paginatedRooms = Array.isArray(rooms)
    ? rooms.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  // ✅ Delete room
  const handleDelete = async (roomId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this room?")) return;
      const res = await deleteRoom(roomId);
      toast.success(res.message || "Room deleted");
      setRooms((prev) => prev.filter((room) => room.roomId !== roomId));
    } catch (error) {
      toast.error(error.message || "Failed to delete room");
    }
  };

  // ✅ Open edit popup
  const openEditPopup = (room) => {
    setEditingRoom({ ...room });
    setIsEditing(true);
  };

  // ✅ Close edit popup
  const closeEditPopup = () => {
    setEditingRoom(null);
    setIsEditing(false);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send editable fields
      const payload = {
        unitNumber: editingRoom.unitNumber,
        floor: editingRoom.floor,
        size: editingRoom.size,
        status: editingRoom.status,
      };

      const res = await updateRoom(editingRoom.roomId, payload);
      toast.success(res.message || "Room updated successfully");
      closeEditPopup();

      // Update frontend state
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === editingRoom.roomId ? { ...r, ...payload } : r
        )
      );
    } catch (error) {
      toast.error(error.message || "Failed to update room");
    }
  };

  // ✅ Pagination
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Room Management
        </h1>
        <Link
          to="/manage-rooms/add"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" /> Add Room
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Unit
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Floor
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Size
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Type
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
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  {room.unitNumber}
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  {room.floor}
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  {room.size}
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  {room.roomType?.typeName}
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  {room.status}
                </td>
                <td className="px-4 py-2 text-right flex justify-end gap-2">
                  <button
                    onClick={() => openEditPopup(room)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </button>
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
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Edit Popup Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Room</h2>
              <button onClick={closeEditPopup}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                type="text"
                value={editingRoom.unitNumber}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, unitNumber: e.target.value })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Unit Number"
              />
              <input
                type="number"
                value={editingRoom.floor}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    floor: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Floor"
              />
              <input
                type="number"
                value={editingRoom.size}
                onChange={(e) =>
                  setEditingRoom({
                    ...editingRoom,
                    size: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Size"
              />
              <select
                value={editingRoom.status}
                onChange={(e) =>
                  setEditingRoom({ ...editingRoom, status: e.target.value })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditPopup}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
