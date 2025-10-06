import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, CheckCircle, XCircle, PlusCircle } from "lucide-react";
import {
  getRequests,
  updateRequestStatus,
  updateMaintenance,
  getMaintenances,
  createMaintenance,
  deleteMaintenance,
} from "../services/maintenanceService";
import { getRooms } from "../services/roomService";
import { useAuth } from "../context/AuthContext";

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    roomId: "",
    description: "",
    cost: "",
    maintenanceStartDate: "",
    maintenanceEndDate: "",
    status: "InProgress",
    recordedBy: user?.userId || null,
  });

  useEffect(() => {
    fetchRequests();
    fetchMaintenances();
    fetchRooms();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getRequests();
      setRequests(data);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  const fetchMaintenances = async () => {
    try {
      const data = await getMaintenances();
      setMaintenances(data);
    } catch {
      toast.error("Failed to load maintenances");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.rooms || []);
    } catch {
      toast.error("Failed to fetch rooms");
      setRooms([]);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateRequestStatus(id, status);
      toast.success(res.message);
      fetchRequests();
      fetchMaintenances();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMaintenance = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;
    try {
      await deleteMaintenance(id);
      toast.success("Maintenance deleted");
      fetchMaintenances();
    } catch {
      toast.error("Failed to delete maintenance");
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        roomId: editItem.roomId,
        description: editItem.description,
        cost: editItem.cost ? Number(editItem.cost) : null,
        maintenanceStartDate: new Date(
          editItem.maintenanceStartDate
        ).toISOString(),
        status: editItem.status,
      };

      if (editItem.status === "Completed" && editItem.maintenanceEndDate) {
        payload.maintenanceEndDate = new Date(
          editItem.maintenanceEndDate
        ).toISOString();
      }

      if (editItem.recordedBy) {
        payload.recordedBy = editItem.recordedBy;
      }

      await updateMaintenance(editItem.maintenanceId, payload);
      toast.success("Maintenance updated");
      setEditItem(null);
      fetchMaintenances();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update maintenance");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenance(formData);
      toast.success("Maintenance added");
      setFormData({
        roomId: "",
        description: "",
        cost: "",
        maintenanceStartDate: "",
        maintenanceEndDate: "",
        status: "InProgress",
      });
      setShowForm(false);
      fetchMaintenances();
    } catch {
      toast.error("Failed to add maintenance");
    }
  };

  return (
    <div className="space-y-10 text-gray-900 dark:text-gray-100">
      {/* Add Maintenance Section */}
      <div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 mb-2"
        >
          <PlusCircle className="w-5 h-5" />
          {showForm ? "Close Form" : "Add Maintenance"}
        </button>
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="p-6 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                  className="border dark:text-white border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900"
                >
                  <option value="">Select Room</option>
                  {Array.isArray(rooms) &&
                    rooms.map((room) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.unitNumber} (Floor {room.floor})
                      </option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="w-full border p-2 rounded bg-white dark:bg-gray-800"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block mb-1 font-medium">Cost</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="w-full border p-2 rounded bg-white dark:bg-gray-800"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="border p-2 rounded w-full bg-white dark:bg-gray-800"
                >
                  <option value="InProgress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block mb-1 font-medium">
                  Maintenance Start Date
                </label>
                <input
                  type="date"
                  value={formData.maintenanceStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceStartDate: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2 rounded bg-white dark:bg-gray-800"
                />
              </div>

              {/* End Date - Only if Completed */}
              <div>
                <label className="block mb-1 font-medium">
                  Maintenance End Date
                </label>
                <input
                  type="date"
                  value={formData.maintenanceEndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceEndDate: e.target.value,
                    })
                  }
                  disabled={formData.status !== "Completed"}
                  className="w-full border p-2 rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Requests Section */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Maintenance Requests</h1>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2">No</th>
              <th className="p-2">Description</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr key={req.requestId} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{req.description}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium 
      ${
        req.status === "Completed"
          ? "bg-green-100 text-green-800"
          : req.status === "InProgress"
          ? "bg-yellow-100 text-yellow-800"
          : req.status === "Pending"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800"
      }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(req.requestId, "Approved")
                    }
                    className="p-2 rounded bg-green-600 text-white hover:bg-green-500"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(req.requestId, "Declined")
                    }
                    className="p-2 rounded bg-red-600 text-white hover:bg-red-500"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Maintenances Section */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Maintenance Records</h1>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2">Room</th>
              <th className="p-2">Description</th>
              <th className="p-2">Cost</th>
              <th className="p-2">Start Date</th>
              <th className="p-2">End Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Recorded By</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((m) => (
              <tr key={m.maintenanceId} className="border-b">
                <td className="p-2">{m.room?.unitNumber || "N/A"}</td>
                <td className="p-2">{m.description}</td>
                <td className="p-2">${m.cost?.toFixed(2) || 0}</td>
                <td className="p-2">
                  {new Date(m.maintenanceStartDate).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {m.maintenanceEndDate
                    ? new Date(m.maintenanceEndDate).toLocaleDateString()
                    : "Ongoing"}
                </td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium 
      ${
        m.status === "Completed"
          ? "bg-green-100 text-green-800"
          : m.status === "InProgress"
          ? "bg-yellow-100 text-yellow-800"
          : m.status === "Pending"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800"
      }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="p-2">{m.user?.fullName || "System"}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => setEditItem(m)} // open popup
                    className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaintenance(m.maintenanceId)}
                    className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Edit Popup */}
      {editItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg space-y-4 w-96"
          >
            <h2 className="text-xl font-bold">Edit Maintenance</h2>

            {/* Description */}
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input
                type="text"
                value={editItem.description}
                onChange={(e) =>
                  setEditItem({ ...editItem, description: e.target.value })
                }
                className="w-full border p-2 rounded bg-white dark:bg-gray-800"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block mb-1 font-medium">Cost</label>
              <input
                type="number"
                value={editItem.cost}
                onChange={(e) =>
                  setEditItem({ ...editItem, cost: e.target.value })
                }
                className="w-full border p-2 rounded bg-white dark:bg-gray-800"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                value={editItem.status}
                onChange={(e) =>
                  setEditItem({ ...editItem, status: e.target.value })
                }
                className="border p-2 rounded w-full bg-white dark:bg-gray-800"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* End Date (only if Completed) */}
            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                value={editItem.maintenanceEndDate || ""}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    maintenanceEndDate: e.target.value,
                  })
                }
                disabled={editItem.status !== "Completed"}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
