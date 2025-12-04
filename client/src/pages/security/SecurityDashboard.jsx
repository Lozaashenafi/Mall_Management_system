// components/security/SecurityDashboard.jsx
import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Package,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getApprovedExitRequests } from "../../services/securityExitRequestService";
import { useAuth } from "../../context/AuthContext";
import SecurityVerificationModal from "./SecurityVerificationModal";
import ExitRequestDetailsModal from "./ExitRequestDetailsModal";

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [trackingSearch, setTrackingSearch] = useState("");

  useEffect(() => {
    fetchApprovedRequests();
  }, [pagination.page, pagination.limit]);

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);
      const response = await getApprovedExitRequests(
        pagination.page,
        pagination.limit
      );
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(error.message || "Failed to load exit requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByTracking = async () => {
    if (!trackingSearch.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    try {
      setLoading(true);
      const response = await getExitRequestByTracking(trackingSearch.trim());
      setRequests([response.data]);
      setPagination({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      });
      toast.success("Request found!");
    } catch (error) {
      toast.error(error.message || "Request not found");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRequest = (request) => {
    setSelectedRequest(request);
    setVerificationModalOpen(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleVerificationComplete = () => {
    setVerificationModalOpen(false);
    setSelectedRequest(null);
    fetchApprovedRequests();
  };

  const resetSearch = () => {
    setTrackingSearch("");
    fetchApprovedRequests();
  };

  const filteredRequests = requests.filter((request) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        request.trackingNumber.toLowerCase().includes(term) ||
        request.tenant?.user?.fullName?.toLowerCase().includes(term) ||
        request.rental?.room?.unitNumber?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Security Officer Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verify and manage approved exit requests
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Logged in as:{" "}
          <span className="font-semibold text-indigo-600">
            {user?.fullName}
          </span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tracking Number Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search by Tracking Number
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              placeholder="Enter tracking number"
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleSearchByTracking}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={resetSearch}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pagination.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Approved
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {requests.filter((r) => r.status === "Verified").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Table Header */}
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold dark:text-white">
            Approved Exit Requests
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, unit, or tracking..."
                className="pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Verified">Verified</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading exit requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No exit requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || trackingSearch
                ? "Try a different search term"
                : "No approved exit requests at the moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Tracking #
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Tenant
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Unit
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Exit Date
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Items
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Status
                  </th>
                  <th className="p-3 text-left text-sm font-semibold dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3">
                      <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {request.trackingNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {request.type}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium dark:text-white">
                        {request.tenant?.user?.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.tenant?.companyName}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="dark:text-white">
                          {request.rental?.room?.unitNumber || "N/A"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {request.rental?.room?.building?.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="dark:text-white">
                          {new Date(request.exitDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(request.exitDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="dark:text-white">
                          {request.items.length} items
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total qty:{" "}
                        {request.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {request.status === "Approved" && (
                          <>
                            <button
                              onClick={() => handleVerifyRequest(request)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Verify Request"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyRequest(request)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Block Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} requests
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-indigo-600 text-white rounded">
                {pagination.page}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <SecurityVerificationModal
            isOpen={verificationModalOpen}
            onClose={() => {
              setVerificationModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onComplete={handleVerificationComplete}
          />

          <ExitRequestDetailsModal
            isOpen={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
          />
        </>
      )}
    </div>
  );
}
