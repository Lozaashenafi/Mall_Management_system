// src/components/overdue/OverdueDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  runOverdueCacheUpdate,
  getOverdueTenants,
  getMostOverdueTenants,
  getFrequentOverdueTenants,
  getOverdueStats,
  getOverdueInvoices,
} from "../../src/services/overdueService";

const getSeverityColorClass = (days) => {
  if (days >= 30)
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (days >= 14)
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  if (days >= 7)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
};

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "indigo",
}) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <div
        className={`p-2 bg-${color}-50 text-${color}-600 rounded-md dark:bg-${color}-900 dark:text-${color}-400`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {value}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const OverdueTenantsList = ({
  tenants,
  title,
  loading,
  showMaxOverdue = false,
  showOverdueCount = false,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Loading {title.toLowerCase()}...
        </p>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No overdue tenants found</p>
        <p className="text-sm">
          All tenants are up to date with their payments.
        </p>
      </div>
    );
  }

  const getMaxOverdueDays = (tenant) => {
    if (!tenant.rental?.invoices?.length) return 0;
    return Math.max(
      ...tenant.rental.invoices.map((inv) => inv.overdueDays || 0)
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.map((tenant) => {
          const maxOverdueDays = showMaxOverdue ? getMaxOverdueDays(tenant) : 0;

          return (
            <div
              key={tenant.tenantId}
              className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Tenant Header */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold dark:bg-indigo-900 dark:text-indigo-300">
                  {tenant.user?.fullName?.charAt(0) || "T"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {tenant.user?.fullName || "Unknown Tenant"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unit {tenant.rental?.room?.unitNumber} • Floor{" "}
                    {tenant.rental?.room?.floor}
                  </p>
                </div>
              </div>

              {/* Overdue Info */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Overdue:
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    ETB {tenant.totalOverdueAmount?.toLocaleString() || "0"}
                  </span>
                </div>

                {showOverdueCount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Overdue Count:
                    </span>
                    <span className="font-semibold">
                      {tenant.overdueCount || 0} times
                    </span>
                  </div>
                )}

                {showMaxOverdue && maxOverdueDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max Overdue:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColorClass(
                        maxOverdueDays
                      )}`}
                    >
                      {maxOverdueDays} days
                    </span>
                  </div>
                )}
              </div>

              {/* Overdue Invoices */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Overdue Invoices:
                </h4>
                <div className="space-y-2">
                  {tenant.rental?.invoices?.slice(0, 3).map((invoice) => (
                    <div
                      key={invoice.invoiceId}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          #{invoice.invoiceId}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          ETB {invoice.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColorClass(
                          invoice.overdueDays
                        )}`}
                      >
                        {invoice.overdueDays} days
                      </span>
                    </div>
                  ))}
                  {tenant.rental?.invoices?.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{tenant.rental.invoices.length - 3} more invoices
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Send Reminder
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OverdueDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [overdueTenants, setOverdueTenants] = useState([]);
  const [mostOverdueTenants, setMostOverdueTenants] = useState([]);
  const [frequentOverdueTenants, setFrequentOverdueTenants] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [statsResponse, tenantsResponse] = await Promise.all([
        getOverdueStats(),
        getOverdueTenants(),
      ]);

      setStats(statsResponse);
      setOverdueTenants(tenantsResponse);
    } catch (error) {
      console.error("Error loading overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "most-overdue":
          const mostOverdueResponse = await getMostOverdueTenants();
          setMostOverdueTenants(mostOverdueResponse);
          break;
        case "frequent":
          const frequentResponse = await getFrequentOverdueTenants();
          setFrequentOverdueTenants(frequentResponse);
          break;
        case "invoices":
          const invoicesResponse = await getOverdueInvoices();
          setOverdueInvoices(invoicesResponse);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      await runOverdueCacheUpdate();
      await loadOverviewData();
      if (activeTab !== "overview") {
        await loadTabData(activeTab);
      }
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (
      tab !== "overview" &&
      ((tab === "most-overdue" && mostOverdueTenants.length === 0) ||
        (tab === "frequent" && frequentOverdueTenants.length === 0) ||
        (tab === "invoices" && overdueInvoices.length === 0))
    ) {
      loadTabData(tab);
    }
  };

  if (loading && activeTab === "overview") {
    return (
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-gray-800 dark:text-white font-bold">
              Overdue Rent Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage overdue rent payments
            </p>
          </div>
          <button
            onClick={handleRefreshCache}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh Cache"}</span>
          </button>
        </div>
        {stats.lastCacheUpdate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {new Date(stats.lastCacheUpdate).toLocaleString()}
          </p>
        )}
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Overdue Tenants"
          value={stats.totalOverdueTenants || 0}
          description="Tenants with overdue payments"
          icon={Users}
          color="red"
        />
        <StatsCard
          title="Total Overdue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
            minimumFractionDigits: 2,
          }).format(stats.totalOverdueAmount || 0)}
          description="Total overdue amount"
          icon={TrendingUp}
          color="orange"
        />
        <StatsCard
          title="Highest Overdue"
          value={`${stats.highestOverdueDays || 0} days`}
          description="Longest overdue period"
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats.totalOverdueInvoices || 0}
          description="Total overdue invoices"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Most Frequent"
          value={`${stats.mostFrequentOffender || 0} times`}
          description="Highest overdue count"
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "most-overdue", label: "Most Overdue" },
              { id: "frequent", label: "Frequent Offenders" },
              { id: "invoices", label: "Overdue Invoices" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <OverdueTenantsList
              tenants={overdueTenants}
              title="All Overdue Tenants"
              loading={loading}
            />
          )}

          {activeTab === "most-overdue" && (
            <OverdueTenantsList
              tenants={mostOverdueTenants}
              title="Most Overdue Tenants (by days)"
              loading={loading}
              showMaxOverdue={true}
            />
          )}

          {activeTab === "frequent" && (
            <OverdueTenantsList
              tenants={frequentOverdueTenants}
              title="Frequent Overdue Offenders"
              loading={loading}
              showOverdueCount={true}
            />
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Overdue Invoices
              </h2>
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : overdueInvoices.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No overdue invoices found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Overdue Days
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {overdueInvoices.map((invoice) => (
                        <tr key={invoice.invoiceId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            #{invoice.invoiceId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {invoice.rental?.tenant?.user?.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            ETB {invoice.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColorClass(
                                invoice.overdueDays
                              )}`}
                            >
                              {invoice.overdueDays} days
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverdueDashboard;
