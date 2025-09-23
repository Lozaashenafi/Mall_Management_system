import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoomTypes, addRoom } from "../services/roomService";
import { toast } from "react-hot-toast";

export default function AddRoom() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitNumber: "",
    floor: "",
    size: "",
    roomTypeId: "", // will store as number on submit
    status: "Vacant",
  });

  const [roomTypes, setRoomTypes] = useState([]);

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await getRoomTypes();
        setRoomTypes(data.roomTypes || []);
      } catch (error) {
        toast.error(error.message || "Failed to load room types");
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert roomTypeId to number immediately
    setFormData((prev) => ({
      ...prev,
      [name]: name === "roomTypeId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure roomTypeId is a number
    if (!formData.roomTypeId) {
      toast.error("Please select a room type");
      return;
    }

    try {
      await addRoom(formData); // backend expects roomTypeId as number
      toast.success("Room added successfully");
      navigate("/manage-rooms");
    } catch (error) {
      toast.error(error.message || "Failed to add room");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Room</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the room details to create a new record
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unit Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Unit Number
            </label>
            <input
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium mb-1">Floor</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-1">Size (sqm)</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Room Type</label>
            <select
              name="roomTypeId"
              value={formData.roomTypeId || ""}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="">Select Room Type</option>
              {roomTypes.map((type) => (
                <option key={type.roomTypeId} value={type.roomTypeId}>
                  {type.typeName}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/manage-rooms")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Save className="w-4 h-4" /> Save Room
          </button>
        </div>
      </form>
    </div>
  );
}
