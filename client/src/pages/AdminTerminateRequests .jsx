import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  Save,
  XCircle,
} from "lucide-react";
import {
  fetchTerminateRequests,
  adminUpdateTerminateRequestStatus,
} from "../services/terminateService";
import toast from "react-hot-toast";

const AdminTerminateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    status: "",
    adminNote: "",
    effectiveDate: "",
  });

  // Load all termination requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetchTerminateRequests();
        setRequests(res.terminateRequests || []);
      } catch (err) {
        console.error("Failed to load termination requests:", err);
      }
    };
    loadRequests();
  }, []);

  // Start editing a request
  const startEdit = (req) => {
    setEditingId(req.terminateRequestId);
    setEditData({
      status: req.status,
      adminNote: req.adminNote || "",
      effectiveDate: req.effectiveDate ? req.effectiveDate.split("T")[0] : "",
    });
  };

  // Save updated request
  const handleEditSave = async (id) => {
    try {
      setLoading(true);
      await adminUpdateTerminateRequestStatus(id, editData);
      toast.success("Request updated successfully!");
      setEditingId(null);

      // Refresh list
      const res = await fetchTerminateRequests();
      setRequests(res.terminateRequests || []);
    } catch (err) {
      toast.error("Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Termination Requests (Admin)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and update termination requests submitted by tenants.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        {requests.map((req) => (
          <div
            key={req.terminateRequestId}
            className="p-6 rounded-xl border bg-white dark:bg-gray-800"
          >
            {editingId === req.terminateRequestId ? (
              <>
                <h2 className="font-semibold text-lg mb-3">Edit Request</h2>
                <div className="space-y-2">
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>

                  <textarea
                    value={editData.adminNote}
                    onChange={(e) =>
                      setEditData({ ...editData, adminNote: e.target.value })
                    }
                    placeholder="Admin note (optional)"
                    rows={3}
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="date"
                    value={editData.effectiveDate}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        effectiveDate: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleEditSave(req.terminateRequestId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                    disabled={loading}
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
                    <FileText className="w-5 h-5" /> Request for{" "}
                    {req.rental?.room?.unitNumber} (
                    {req.rental?.tenant?.contactPerson})
                  </h2>
                  <button
                    onClick={() => startEdit(req)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                </div>

                <p>
                  <span className="font-medium">Reason:</span> {req.reason}
                </p>
                <p>
                  <span className="font-medium">Preferred Date:</span>{" "}
                  {req.effectiveDate ? req.effectiveDate.split("T")[0] : "—"}
                </p>
                {req.adminNote && (
                  <p>
                    <span className="font-medium">Admin Note:</span>{" "}
                    {req.adminNote}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>
                    Submitted On:{" "}
                    <span className="font-medium">
                      {req.requestDate?.split("T")[0]}
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

export default AdminTerminateRequests;
