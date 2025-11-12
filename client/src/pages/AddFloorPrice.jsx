import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation
import {
  addOrUpdatePriceofCare,
  getPriceofCare,
} from "../services/priceofCareService";

export default function AddFloorPrice() {
  const navigate = useNavigate(); // ✅ Hook to navigate back

  const [formData, setFormData] = useState({
    floor: "",
    basePrice: "",
  });

  const [prices, setPrices] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch existing prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getPriceofCare();
        setPrices(data || []);
      } catch (error) {
        toast.error(error.message || "Failed to load prices");
      }
    };
    fetchPrices();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "floor" || name === "basePrice" ? Number(value) : value,
    }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.floor || !formData.basePrice) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addOrUpdatePriceofCare({
        ...formData,
        PriceId: editingId || undefined,
      });

      toast.success(
        editingId ? "Price updated successfully" : "Price added successfully"
      );

      // Reset form and refresh table
      setFormData({ floor: "", basePrice: "" });
      setEditingId(null);

      const data = await getPriceofCare();
      setPrices(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to save price");
    }
  };

  // ✅ Handle edit
  const handleEdit = (price) => {
    setFormData({
      floor: price.floor,
      basePrice: price.basePrice,
    });
    setEditingId(price.PriceId);
  };

  // ✅ Handle cancel edit
  const handleCancel = () => {
    setFormData({ floor: "", basePrice: "" });
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100 relative">
      {/* ✅ Top-right X button */}
      <button
        onClick={() => navigate("/manage-rooms")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        title="Go back"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Price of Care</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add or update base prices for each floor
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">Base Price</label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Update Price" : "Add Price"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Floor</th>
              <th className="px-4 py-2 text-left">Base Price</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Updated At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prices.length > 0 ? (
              prices.map((price) => (
                <tr
                  key={price.PriceId}
                  className="border-t border-gray-300 dark:border-gray-700"
                >
                  <td className="px-4 py-2">{price.floor}</td>
                  <td className="px-4 py-2">${price.basePrice.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {new Date(price.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(price.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(price)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No prices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
