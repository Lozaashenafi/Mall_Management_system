import React, { useState, useEffect } from "react";
import { Wrench, Clock, CheckCircle, PlusCircle, Trash } from "lucide-react";
import {
  createMaintenanceRequest,
  getTenantRequests,
  deleteRequest,
} from "../../services/maintenanceService";
import { useAuth } from "../../context/AuthContext";

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex flex-col space-y-2">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
      {value}
    </p>
  </div>
);

const TenantMaintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState("");
  const [rentals, setRentals] = useState([]);
  const [selectedRentId, setSelectedRentId] = useState("");

  useEffect(() => {
    // Load rentals from localStorage
    const storedRentals = JSON.parse(localStorage.getItem("rentals")) || [];
    setRentals(storedRentals);

    // Auto-select the first rental if available
    if (storedRentals.length > 0) {
      setSelectedRentId(storedRentals[0].rentId);
    }

    if (user?.userId) {
      fetchRequests(user.userId);
    }
  }, [user]);

  const fetchRequests = async (tenantId) => {
    try {
      const data = await getTenantRequests(tenantId);
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch maintenance requests:", err);
    }
  };

  const handleAddRequest = async () => {
    if (!newRequest.trim() || !selectedRentId) {
      alert("Please select a rental and describe your issue.");
      return;
    }

    try {
      const res = await createMaintenanceRequest({
        rentId: Number(selectedRentId),
        description: newRequest,
      });
      setRequests([res.request, ...requests]);
      setNewRequest("");
    } catch (err) {
      console.error("Failed to submit request:", err.message || err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRequest(id);
      setRequests(requests.filter((req) => req.requestId !== id));
    } catch (err) {
      console.error("Failed to delete request:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Maintenance Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit and track your maintenance requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Pending Requests"
          value={requests.filter((r) => r.status === "Pending").length}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatsCard
          title="In Progress"
          value={requests.filter((r) => r.status === "In Progress").length}
          icon={Wrench}
          color="bg-blue-500"
        />
        <StatsCard
          title="Completed"
          value={requests.filter((r) => r.status === "Completed").length}
          icon={CheckCircle}
          color="bg-green-500"
        />
      </div>

      {/* New Request Form */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Submit a New Request
        </h2>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Rental Selector */}
          <select
            value={selectedRentId}
            onChange={(e) => setSelectedRentId(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Rental</option>
            {rentals.map((r) => (
              <option key={r.rentId} value={r.rentId}>
                {r.room.unitNumber} ({r.status})
              </option>
            ))}
          </select>

          {/* Description Input */}
          <input
            type="text"
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Describe your issue..."
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Submit Button */}
          <button
            onClick={handleAddRequest}
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
          >
            <PlusCircle className="w-5 h-5" />
            Submit
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Your Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No maintenance requests found.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Description</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.requestId}
                  className="border-b dark:border-gray-700"
                >
                  <td className="p-3">{req.requestId}</td>
                  <td className="p-3">{req.description}</td>
                  <td className="p-3">
                    {req.requestDate
                      ? new Date(req.requestDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        req.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : req.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(req.requestId)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TenantMaintenance;
