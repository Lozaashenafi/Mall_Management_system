import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  XCircle,
  Save,
} from "lucide-react";
import {
  terminateRequest,
  fetchTerminateRequestsByUser,
  editTerminateRequest,
  deleteTerminateRequest,
} from "../../services/terminateService";
import toast from "react-hot-toast";

const TenantTerminateRequest = () => {
  const [formData, setFormData] = useState({
    reason: "",
    effectiveDate: "",
    rentId: "",
  });
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ reason: "", effectiveDate: "" });

  // 🧠 Load rentals + existing termination requests
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = localStorage.getItem("rentals");
        const user = JSON.parse(localStorage.getItem("user"));
        if (storedData && user) {
          const parsed = JSON.parse(storedData);
          setRentals(parsed);
          if (parsed.length > 0)
            setFormData((prev) => ({ ...prev, rentId: parsed[0].rentId }));

          const res = await fetchTerminateRequestsByUser(user.userId);
          setSubmittedRequests(res.terminateRequests || []);
        }
      } catch (e) {
        console.error("Error loading data:", e);
      }
    };
    loadData();
  }, []);

  // 🧾 Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 Submit Termination Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      reason: formData.reason,
      effectiveDate: formData.effectiveDate,
      rentId: Number(formData.rentId),
    };

    try {
      const response = await terminateRequest(payload);
      setSubmittedRequests((prev) => [response.terminateRequest, ...prev]);
      toast.success("Termination request submitted!");
      setFormData((prev) => ({ ...prev, reason: "", effectiveDate: "" }));
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Start Editing
  const startEdit = (req) => {
    setEditingId(req.terminateRequestId);
    setEditData({
      reason: req.reason,
      effectiveDate: req.effectiveDate ? req.effectiveDate.split("T")[0] : "",
    });
  };

  // 💾 Save Edit
  const handleEditSave = async (id) => {
    try {
      await editTerminateRequest(id, editData);
      toast.success("Request updated successfully!");
      setEditingId(null);

      // Refresh list
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetchTerminateRequestsByUser(user.userId);
      setSubmittedRequests(res.terminateRequests || []);
    } catch (err) {
      toast.error("Failed to update request");
    }
  };

  // ❌ Delete Request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await deleteTerminateRequest(id);
      toast.success("Request deleted successfully!");
      setSubmittedRequests((prev) =>
        prev.filter((r) => r.terminateRequestId !== id)
      );
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Terminate Rental Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit or manage your termination requests below.
        </p>
      </div>

      {/* Create Form */}
      {rentals.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Rental
            </label>
            <select
              name="rentId"
              value={formData.rentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            >
              {rentals.map((r) => (
                <option key={r.rentId} value={r.rentId}>
                  {r.room.unitNumber} ({r.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for Termination
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Explain why you want to terminate..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Effective Termination Date
            </label>
            <input
              type="date"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {/* Submitted Requests */}
      <div className="space-y-4 mt-6">
        {submittedRequests.map((req) => (
          <div
            key={req.terminateRequestId}
            className="p-6 rounded-xl border bg-white dark:bg-gray-800"
          >
            {editingId === req.terminateRequestId ? (
              <>
                <h2 className="font-semibold text-lg mb-3">Edit Request</h2>
                <textarea
                  name="reason"
                  value={editData.reason}
                  onChange={(e) =>
                    setEditData({ ...editData, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full border rounded-lg p-2 mb-3"
                />
                <input
                  type="date"
                  name="effectiveDate"
                  value={editData.effectiveDate}
                  onChange={(e) =>
                    setEditData({ ...editData, effectiveDate: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditSave(req.terminateRequestId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <XCircle size={18} /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Termination Request for{" "}
                    {req.rental?.room?.unitNumber}{" "}
                    {/* <-- changed from request */}
                  </h2>
                  {req.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(req)}
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(req.terminateRequestId)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <p>
                  <span className="font-medium">Reason:</span> {req.reason}
                </p>
                <p>
                  <span className="font-medium">Effective Date:</span>{" "}
                  {req.effectiveDate ? req.effectiveDate.split("T")[0] : "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>
                    Submitted On:{" "}
                    <span className="font-medium">
                      {req.requestDate ? req.requestDate.split("T")[0] : "—"}{" "}
                      {/* <-- fixed */}
                    </span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {req.status === "Pending" && (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  {req.status === "Approved" && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {req.status === "Declined" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>{req.status}</span>
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default TenantTerminateRequest;
