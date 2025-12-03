import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getMyExitRequests } from "../../services/exitRequestService";
import { useAuth } from "../../context/AuthContext";

export default function ExitRequests() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth(); // Add authLoading if available

  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]); // All data from server
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    startDate: "",
    endDate: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Status badges
  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Rejected: { color: "bg-red-100 text-red-red-800", icon: XCircle },
    Verified: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    Blocked: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
  };

  // Type badges
  const typeConfig = {
    Temporary: "bg-purple-100 text-purple-800",
    Permanent: "bg-indigo-100 text-indigo-800",
  };

  useEffect(() => {
    // Only fetch if user is available
    if (user && user.userId) {
      fetchAllExitRequests();
    } else if (user === null && !authLoading) {
    }
  }, [user, authLoading]); // Add dependencies

  const fetchAllExitRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyExitRequests(user.userId); // Now safe to access
      setAllRequests(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load exit requests");
      setAllRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering
  const filteredRequests = useMemo(() => {
    let filtered = [...allRequests];

    // 1. Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.trackingNumber?.toLowerCase().includes(searchTerm) ||
          request.purpose?.toLowerCase().includes(searchTerm) ||
          request.items?.some(
            (item) =>
              item.itemName?.toLowerCase().includes(searchTerm) ||
              item.description?.toLowerCase().includes(searchTerm) ||
              item.serialNumber?.toLowerCase().includes(searchTerm)
          )
      );
    }

    // 2. Apply status filter
    if (filters.status) {
      filtered = filtered.filter(
        (request) => request.status === filters.status
      );
    }

    // 3. Apply type filter
    if (filters.type) {
      filtered = filtered.filter((request) => request.type === filters.type);
    }

    // 4. Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(
        (request) => new Date(request.exitDate) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (request) => new Date(request.exitDate) <= endDate
      );
    }

    return filtered;
  }, [
    allRequests,
    filters.search,
    filters.status,
    filters.type,
    filters.startDate,
    filters.endDate,
  ]);

  // Paginate results
  const paginatedRequests = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, filters.page, filters.limit]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredRequests.length / filters.limit);
  const totalRecords = filteredRequests.length;
  const startIndex = Math.min(
    (filters.page - 1) * filters.limit + 1,
    totalRecords
  );
  const endIndex = Math.min(filters.page * filters.limit, totalRecords);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 })); // Reset to page 1
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      type: "",
      startDate: "",
      endDate: "",
      search: "",
      page: 1,
      limit: 10,
    });
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    const Icon = statusConfig[status]?.icon || AlertCircle;
    return <Icon className="w-4 h-4 mr-1" />;
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this exit request?")) {
      return;
    }

    try {
      // You'll need to implement cancelExitRequest in your service
      // await cancelExitRequest(requestId);
      toast.success("Exit request cancelled successfully");
      fetchAllExitRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to cancel exit request");
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "Pending").length,
      approved: allRequests.filter((r) => r.status === "Approved").length,
      temporary: allRequests.filter((r) => r.type === "Temporary").length,
      permanent: allRequests.filter((r) => r.type === "Permanent").length,
      verified: allRequests.filter((r) => r.status === "Verified").length,
      blocked: allRequests.filter((r) => r.status === "Blocked").length,
      rejected: allRequests.filter((r) => r.status === "Rejected").length,
    };
  }, [allRequests]);

  const activeFilterCount = [
    filters.status,
    filters.type,
    filters.startDate,
    filters.endDate,
    filters.search,
  ].filter(Boolean).length;

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please log in to view exit requests
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exit Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your item removal requests
          </p>
        </div>

        <button
          onClick={() => navigate("/tenant/exit-requests/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Exit Request
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <Package className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{statistics.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{statistics.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Temporary</p>
              <p className="text-2xl font-bold">{statistics.temporary}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tracking, item name, or description..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Search
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Verified">Verified</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Types</option>
                <option value="Temporary">Temporary</option>
                <option value="Permanent">Permanent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Active Filters:</span>
              {filters.status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Status: {filters.status}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: "" }))
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Type: {filters.type}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, type: "" }))
                    }
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  From: {new Date(filters.startDate).toLocaleDateString()}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, startDate: "" }))
                    }
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  To: {new Date(filters.endDate).toLocaleDateString()}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, endDate: "" }))
                    }
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, search: "" }))
                    }
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing {startIndex} to {endIndex} of {totalRecords} requests
          {filters.search && ` matching "${filters.search}"`}
        </div>
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                limit: Number(e.target.value),
                page: 1,
              }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading exit requests...
            </p>
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No exit requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeFilterCount > 0
                ? "Try adjusting your filters"
                : "Get started by creating your first exit request"}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/tenant/exit-requests/new")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Exit Request
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Exit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRequests.map((request) => (
                    <tr
                      key={request.requestId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-semibold">
                          {request.trackingNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            typeConfig[request.type]
                          }`}
                        >
                          {request.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{request.items?.length || 0} items</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {request.items?.[0]?.itemName}
                          {request.items?.length > 1 &&
                            ` +${request.items.length - 1} more`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.exitDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            statusConfig[request.status]?.color
                          }`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/tenant/exit-requests/${request.requestId}`
                              )
                            }
                            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                          >
                            View
                          </button>
                          {request.status === "Pending" && (
                            <button
                              onClick={() => handleCancel(request.requestId)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Page {filters.page} of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: 1 }))
                      }
                      disabled={filters.page === 1}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={filters.page === 1}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {(() => {
                        const pages = [];
                        let startPage = Math.max(1, filters.page - 2);
                        let endPage = Math.min(totalPages, filters.page + 2);

                        // Adjust if we're near the start
                        if (filters.page <= 3) {
                          endPage = Math.min(5, totalPages);
                        }

                        // Adjust if we're near the end
                        if (filters.page >= totalPages - 2) {
                          startPage = Math.max(1, totalPages - 4);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() =>
                                setFilters((prev) => ({ ...prev, page: i }))
                              }
                              className={`w-8 h-8 rounded-lg ${
                                filters.page === i
                                  ? "bg-indigo-600 text-white"
                                  : "border hover:bg-gray-50"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={filters.page === totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: totalPages }))
                      }
                      disabled={filters.page === totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
