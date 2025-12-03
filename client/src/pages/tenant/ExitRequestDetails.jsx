import { useState, useEffect } from "react";
import {
  Calendar,
  Package,
  User,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getExitRequestById } from "../../services/exitRequestService";

export default function ExitRequestDetails() {
  const { requestId } = useParams();
  const id = requestId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    console.log("Request ID:", id);
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await getExitRequestById(id);
      console.log("Response received:", response);

      if (!response) {
        throw new Error("No data received from server");
      }

      // Check if response has data property or is the data itself
      const requestData = response.data || response;
      setRequest(requestData);
    } catch (error) {
      console.error("Error details:", error);
      toast.error(error.message || "Failed to load exit request details");
      navigate("/tenant/exit-requests");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Verified":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "Blocked":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto dark:border-indigo-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading exit request details...
        </p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">Exit request not found</p>
        <button
          onClick={() => navigate("/tenant/exit-requests")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Back to List
        </button>
      </div>
    );
  }

  const totalItems =
    request.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const totalValue =
    request.items?.reduce(
      (sum, item) => sum + (parseFloat(item.estimatedValue) || 0),
      0
    ) || 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exit Request Details
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tracking #: {request.trackingNumber || "N/A"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => navigate("/tenant/exit-requests")}
            className="px-4 py-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {request.status || "Unknown"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Submitted on {formatDate(request.requestDate)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                request.type === "Temporary"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
              }`}
            >
              {request.type || "Temporary"} Removal
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Request Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Rental Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Building className="w-5 h-5" />
              Rental Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unit Number
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.rental?.room?.unitNumber ||
                    request.unitNumber ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Building
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.rental?.room?.building?.name ||
                    request.buildingName ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Exit Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(request.exitDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Company
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.tenant?.companyName || request.companyName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="w-5 h-5" />
              Purpose
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {request.purpose || "No purpose provided"}
            </p>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Package className="w-5 h-5" />
                Items ({totalItems} total)
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Value: ${totalValue.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              {request.items?.length > 0 ? (
                request.items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded p-4 dark:border-gray-600"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.itemName || "Unnamed Item"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.description || "No description"}
                        </p>
                        {item.serialNumber && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Serial: {item.serialNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Qty: {item.quantity || 1}
                        </p>
                        {item.estimatedValue > 0 && (
                          <p className="text-green-600 dark:text-green-400">
                            ${parseFloat(item.estimatedValue).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No items listed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Notes */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="border-l-2 border-indigo-500 dark:border-indigo-400 pl-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  Request Submitted
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(request.requestDate)}
                </p>
              </div>

              {request.adminReviewDate && (
                <div className="border-l-2 border-green-500 dark:border-green-400 pl-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Admin Review
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(request.adminReviewDate)}
                  </p>
                  {request.adminNote && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {request.adminNote}
                    </p>
                  )}
                </div>
              )}

              {request.securityCheckDate && (
                <div className="border-l-2 border-blue-500 dark:border-blue-400 pl-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Security Verification
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(request.securityCheckDate)}
                  </p>
                  {request.securityNote && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {request.securityNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contacts
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Admin Officer
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.adminOfficer?.fullName ||
                    request.adminName ||
                    "Not assigned yet"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Security Officer
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.securityOfficer?.fullName ||
                    request.securityName ||
                    "Not assigned yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {request.status === "Pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Pending Actions
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Your request is under review by the admin team.
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this request?"
                    )
                  ) {
                    // Implement cancel functionality
                    toast.success("Cancellation request sent");
                  }
                }}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                Cancel Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
