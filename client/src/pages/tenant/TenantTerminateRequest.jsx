import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  terminateRequest,
  getAllTerminations,
} from "../../services/terminateService";
import { getTenantRentals } from "../../services/terminateService";
import toast from "react-hot-toast";

const TenantTerminateRequest = ({ token, userId }) => {
  const [formData, setFormData] = useState({
    reason: "",
    terminationDate: "",
    rentId: "",
  });
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [tenantRentals, setTenantRentals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tenant rentals dynamically
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const rentals = await getTenantRentals(userId, token); // Assume API fetches all active rentals for tenant
        setTenantRentals(rentals);
        if (rentals.length > 0) {
          setFormData((prev) => ({ ...prev, rentId: rentals[0].rentId })); // default to first rental
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch rentals");
      }
    };

    const fetchRequests = async () => {
      try {
        const requests = await getAllTerminations(token);
        setSubmittedRequests(requests);
      } catch (err) {
        toast.error(err.message || "Failed to fetch termination requests");
      }
    };

    fetchRentals();
    fetchRequests();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      reason: formData.reason,
      effectiveDate: formData.terminationDate,
      rentId: Number(formData.rentId),
    };

    try {
      const res = await terminateRequest(payload, token);
      setSubmittedRequests((prev) => [res.terminateRequest, ...prev]);
      toast.success("Termination request submitted successfully!");
      setFormData((prev) => ({ ...prev, reason: "", terminationDate: "" }));
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Terminate Rental Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit a request to end your rental agreement. Your landlord will
          review it.
        </p>
      </div>

      {/* Request Form */}
      {tenantRentals.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 space-y-6"
        >
          {/* Select Rental */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Rental
            </label>
            <select
              name="rentId"
              value={formData.rentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
            >
              {tenantRentals.map((rental) => (
                <option key={rental.rentId} value={rental.rentId}>
                  {rental.room.name} ({rental.status})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Termination
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              placeholder="Explain why you want to terminate..."
            />
          </div>

          {/* Termination Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Termination Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="terminationDate"
                value={formData.terminationDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              />
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {/* Requests List */}
      <div className="space-y-4 mt-6">
        {submittedRequests.map((request) => (
          <div
            key={request.terminateRequestId}
            className="p-6 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Termination Request for{" "}
              {request.rental.room.name}
            </h2>

            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Reason:</span> {request.reason}
              </p>
              <p>
                <span className="font-medium">Preferred Date:</span>{" "}
                {request.preferredTerminationDate?.split("T")[0]}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>
                  Submitted On:{" "}
                  <span className="font-medium">
                    {request.requestDate?.split("T")[0]}
                  </span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {request.status === "Pending" && (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                {request.status === "Approved" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {request.status === "Declined" && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span>{request.status}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantTerminateRequest;
