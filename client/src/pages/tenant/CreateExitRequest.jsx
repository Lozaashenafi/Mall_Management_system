import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Package,
  Calendar,
  Building,
  Info,
  DollarSign,
  Hash,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createExitRequest } from "../../services/exitRequestService";
import { useAuth } from "../../context/AuthContext";

export default function CreateExitRequest() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([
    {
      itemName: "",
      description: "",
      quantity: 1,
      serialNumber: "",
      estimatedValue: "",
    },
  ]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to create an exit request");
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    try {
      const storedData = localStorage.getItem("rentals");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setRentals(parsed);
        // Set the first rental as default if available
        if (parsed.length > 0) {
          setFormData((prev) => ({
            ...prev,
            rentId: parsed[0].rentId.toString(),
          }));
        }
      } else {
        // If no rentals in localStorage, try to fetch them
        toast.error(
          "No rental information found. Please refresh or contact support."
        );
      }
    } catch (e) {
      console.error("Error loading rental data from localStorage:", e);
      toast.error("Failed to load rental information");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const [formData, setFormData] = useState({
    userId: user?.userId || "",
    rentId: "",
    exitDate: "",
    purpose: "",
    type: "Temporary",
  });

  // Update formData when user loads
  useEffect(() => {
    if (user?.userId) {
      setFormData((prev) => ({
        ...prev,
        userId: user.userId,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rental selection change
  const handleRentalChange = (e) => {
    const rentId = e.target.value;
    setFormData((prev) => ({ ...prev, rentId }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];

    // Handle numeric fields
    if (name === "quantity" || name === "estimatedValue") {
      newItems[index][name] = value === "" ? "" : Number(value);
    } else {
      newItems[index][name] = value;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        description: "",
        quantity: 1,
        serialNumber: "",
        estimatedValue: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const validateForm = () => {
    if (!user?.userId) {
      toast.error("User not authenticated");
      return false;
    }

    if (!formData.rentId) {
      toast.error("Please select a rental");
      return false;
    }

    if (!formData.exitDate) {
      toast.error("Please select an exit date");
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get exit date without time
    const exitDate = new Date(formData.exitDate);
    exitDate.setHours(0, 0, 0, 0);

    if (exitDate < today) {
      toast.error("Exit date cannot be in the past");
      return false;
    }

    if (!formData.purpose.trim()) {
      toast.error("Please enter purpose of removal");
      return false;
    }

    if (formData.purpose.length > 500) {
      toast.error("Purpose cannot exceed 500 characters");
      return false;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName.trim()) {
        toast.error(`Item ${i + 1}: Name is required`);
        return false;
      }
      if (item.itemName.length > 200) {
        toast.error(`Item ${i + 1}: Name cannot exceed 200 characters`);
        return false;
      }
      if (item.quantity < 1) {
        toast.error(`Item ${i + 1}: Quantity must be at least 1`);
        return false;
      }
      if (item.description && item.description.length > 500) {
        toast.error(`Item ${i + 1}: Description cannot exceed 500 characters`);
        return false;
      }
      if (item.serialNumber && item.serialNumber.length > 100) {
        toast.error(
          `Item ${i + 1}: Serial number cannot exceed 100 characters`
        );
        return false;
      }
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const payload = {
      ...formData,
      userId: user.userId,
      rentId: Number(formData.rentId),
      items: items.map((item) => ({
        itemName: item.itemName.trim(),
        description: (item.description || "").trim(), // Empty string
        quantity: Number(item.quantity),
        serialNumber: (item.serialNumber || "").trim(), // Empty string
        estimatedValue: item.estimatedValue
          ? Number(item.estimatedValue)
          : null, // Only numbers can be null
      })),
    };

    try {
      const response = await createExitRequest(payload);
      toast.success("Exit request submitted successfully!");
      navigate("/tenant/exit-requests", {
        state: {
          message:
            "Exit request created! Tracking #: " + response.data.trackingNumber,
        },
      });
    } catch (err) {
      toast.error(err.message || "Failed to submit exit request");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRental = rentals.find(
    (r) => r.rentId === Number(formData.rentId)
  );

  // Show loading while auth is loading or rentals are loading
  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to create an exit request
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Create Exit Request
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Request permission to remove items from your rental unit
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rental Selection */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Rental Unit
            </h2>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Rental Unit *
            </label>
            {rentals.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      No active rentals found.
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Please ensure you have an active rental or contact
                      support.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <select
                  name="rentId"
                  value={formData.rentId}
                  onChange={handleRentalChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a rental unit</option>
                  {rentals.map((r) => (
                    <option key={r.rentId} value={r.rentId}>
                      {r.room?.unitNumber
                        ? `Unit ${r.room.unitNumber} - ${
                            r.room.building?.name || "Unknown Building"
                          }`
                        : `Rental #${r.rentId}`}
                    </option>
                  ))}
                </select>

                {selectedRental && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Unit Number</p>
                        <p className="font-medium">
                          {selectedRental.room?.unitNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Building</p>
                        <p className="font-medium">
                          {selectedRental.room?.building?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Monthly Rent</p>
                        <p className="font-medium">
                          ${selectedRental.rentAmount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            selectedRental.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {selectedRental.status}
                        </span>
                      </div>
                    </div>
                    {selectedRental.room?.building?.address && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedRental.room.building.address}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className=" mb-2 text-sm font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Exit Date *
            </label>
            <input
              type="date"
              name="exitDate"
              value={formData.exitDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Request Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600"
            >
              <option value="Temporary">Temporary Removal</option>
              <option value="Permanent">Permanent Removal</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.type === "Temporary"
                ? "Items will be returned to the premises"
                : "Items will be permanently removed"}
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className=" mb-2 text-sm font-medium flex items-center gap-1">
            <Info className="w-4 h-4" />
            Purpose of Removal *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe why you need to remove these items..."
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Maximum 500 characters</p>
            <p className="text-xs text-gray-500">
              {formData.purpose.length}/500
            </p>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Items to Remove
              </h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="mb-4 p-4 border rounded-lg bg-white dark:bg-gray-600"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium dark:text-white">
                  Item {index + 1}
                </h3>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm dark:text-gray-300">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, e)}
                    name="itemName"
                    required
                    maxLength={200}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Office Chair, Computer Monitor"
                  />
                </div>

                <div>
                  <label className=" mb-1 text-sm dark:text-gray-300 flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    name="quantity"
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    name="description"
                    maxLength={500}
                    rows={2}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Additional details about the item..."
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm dark:text-gray-300">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={item.serialNumber}
                    onChange={(e) => handleItemChange(index, e)}
                    name="serialNumber"
                    maxLength={100}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="If applicable"
                  />
                </div>

                <div>
                  <label className=" mb-1 text-sm dark:text-gray-300 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Estimated Value ($)
                  </label>
                  <input
                    type="number"
                    value={item.estimatedValue}
                    onChange={(e) => handleItemChange(index, e)}
                    name="estimatedValue"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-1 mb-1">
              <span className="text-green-500">✓</span> At least one item is
              required
            </p>
            <p className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Provide accurate
              descriptions for security verification
            </p>
          </div>
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 dark:text-white">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-lg font-semibold">{items.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-lg font-semibold">
                  {items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-semibold">
                  $
                  {items
                    .reduce(
                      (sum, item) => sum + (Number(item.estimatedValue) || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Request Type</p>
                <p className="text-lg font-semibold">{formData.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate("/tenant/exit-requests")}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || rentals.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
