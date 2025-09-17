import { useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddRoom() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitNumber: "",
    floor: "",
    size: "",
    roomType: "",
    status: "Vacant",
    image: null, // optional room image
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room Added:", formData);

    // 🚀 Replace with API call:
    // const data = new FormData();
    // Object.keys(formData).forEach(key => data.append(key, formData[key]));
    // await axios.post("/api/rooms", data, { headers: { "Content-Type": "multipart/form-data" } });

    // Navigate back after adding room
    navigate("/manage-rooms");
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

      {/* Form */}
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
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="">Select Room Type</option>
              <option value="Retail">Retail</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Kiosk">Kiosk</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Service">Service</option>
              <option value="Office">Office</option>
              <option value="Storage">Storage</option>
              <option value="Other">Other</option>
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

          {/* Room Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Room Image (optional)
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
