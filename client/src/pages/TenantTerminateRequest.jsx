import React, { useState } from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const TenantTerminateRequest = () => {
  const [formData, setFormData] = useState({
    reason: "",
    terminationDate: "",
  });

  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = {
      id: Date.now(),
      ...formData,
      status: "Pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };

    setSubmittedRequest(newRequest);
    setFormData({ reason: "", terminationDate: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
      {!submittedRequest && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-gray-200 bg-white shadow-md 
                     dark:border-gray-700 dark:bg-gray-800 space-y-6"
        >
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 
                         dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 
                         focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 
                           dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 
                           focus:ring-2 focus:ring-purple-500"
              />
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-red-600 text-white font-medium 
                       hover:bg-red-700 transition"
          >
            Submit Request
          </button>
        </form>
      )}

      {/* Request Status */}
      {submittedRequest && (
        <div
          className="p-6 rounded-xl border border-gray-200 bg-white shadow-md 
                     dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Your Termination Request
          </h2>

          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Reason:</span>{" "}
              {submittedRequest.reason}
            </p>
            <p>
              <span className="font-medium">Preferred Date:</span>{" "}
              {submittedRequest.terminationDate}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>
                Submitted On:{" "}
                <span className="font-medium">
                  {submittedRequest.submittedAt}
                </span>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {submittedRequest.status === "Pending" && (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              {submittedRequest.status === "Approved" && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {submittedRequest.status === "Rejected" && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span>{submittedRequest.status}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantTerminateRequest;
