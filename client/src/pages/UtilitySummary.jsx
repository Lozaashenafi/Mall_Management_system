import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiDollarSign,
  FiZap,
  FiDroplet,
  FiCpu,
  FiLoader,
  FiDownload, // Added FiDownload
  FiCheckCircle, // Added FiCheckCircle for status
} from "react-icons/fi";
import {
  DownloadUtilityInvoice,
  generateUtilityCharge,
  getSummaryUtilityCharges,
  getTenantsInvoicesOfMonth,
  getUtilityChargesByMonth,
} from "../services/utilityService";

// Helper to show icons for utility types (Moved outside component)
const getUtilityIcon = (type) => {
  switch (type) {
    case "Water":
      return <FiDroplet className="text-indigo-500 w-5 h-5" />;
    case "Electricity":
      return <FiZap className="text-yellow-500 w-5 h-5" />;
    case "Generator":
      return <FiCpu className="text-red-500 w-5 h-5" />;
    case "Service":
      return <FiDollarSign className="text-green-500 w-5 h-5" />;
    default:
      return <FiDollarSign className="text-gray-500 w-5 h-5" />;
  }
};

export default function UtilitySummary() {
  // Initialize month to YYYY-MM of the current date
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [charges, setCharges] = useState([]);
  const [tenantInvoices, setTenantInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null); // Used to track which invoice is downloading
  const navigate = useNavigate();

  // --- Data Fetching Functions ---

  const fetchTenantInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const data = await getTenantsInvoicesOfMonth(month);
      console.log("Fetched tenant invoices:", data);
      setTenantInvoices(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch tenant invoices"
      );
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await getSummaryUtilityCharges(month);
      setSummary(data.utilities);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchCharges = async () => {
    try {
      const data = await getUtilityChargesByMonth(month);
      setCharges(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch charges");
    }
  };

  // --- Handlers ---

  const handleDownloadInvoice = async (invoiceId) => {
    const toastId = toast.loading("Preparing your invoice...");
    setDownloadingId(invoiceId); // Set the downloading ID

    try {
      const blob = await DownloadUtilityInvoice(invoiceId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `utility-invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Download error:", err);
      toast.error(err.response?.data?.message || "Failed to download invoice", {
        id: toastId,
      });
    } finally {
      setDownloadingId(null); // Clear the downloading ID regardless of success/fail
    }
  };

  const handleGenerateCharges = async () => {
    if (!month) return toast.error("Please select a month first");
    setGenerating(true);
    try {
      const data = await generateUtilityCharge(month);
      toast.success(data.message || "Utility charges generated successfully");

      // Re-fetch all data to update the UI
      fetchSummary();
      fetchCharges();
      fetchTenantInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate charges");
    } finally {
      setGenerating(false);
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetchSummary();
    fetchCharges();
    fetchTenantInvoices();
  }, [month]); // Dependency array to re-run when month changes

  // --- Render ---

  const formattedMonth = new Date(`${month}-01`).toLocaleString("en-us", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 🌟 Header and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-4 sm:mb-0">
          <FiCalendar className="text-indigo-600" />
          Utility & Billing Dashboard
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <button
            onClick={handleGenerateCharges}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {generating ? (
              <>
                <FiLoader className="animate-spin w-4 h-4" /> Generating...
              </>
            ) : (
              "Generate Charges"
            )}
          </button>
        </div>
      </div>

      {/* 📊 Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Breakdown Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiDollarSign className="text-indigo-500" /> Total Utility Expenses
            for {formattedMonth}
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <FiLoader className="animate-spin w-5 h-5" /> Loading summary...
              </p>
            </div>
          ) : summary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Utility Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                    >
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        {getUtilityIcon(item.name)} {item.name}
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-right text-green-600 dark:text-green-400">
                        ${Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-10 text-center">
              No aggregated utility data found for this month.
            </p>
          )}
        </div>

        {/* Utility Charges List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCpu className="text-indigo-500" /> Raw Utility Charges (
            {charges.length})
          </h2>

          {charges.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {charges.map((item) => (
                <li
                  key={item.utilityChargeId}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition hover:border-indigo-400"
                >
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {getUtilityIcon(item.type)} {item.type}
                  </span>
                  <span className="font-extrabold text-lg text-green-600 dark:text-green-400">
                    ${Number(item.totalCost).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
              No individual utility charges recorded for this month.
            </p>
          )}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 📝 Tenant Invoices Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="text-indigo-500" /> Tenant Bills for
          {formattedMonth}
        </h2>

        {loadingInvoices ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <FiLoader className="animate-spin w-5 h-5" /> Loading tenant
              invoices...
            </p>
          </div>
        ) : tenantInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tenantInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {invoice?.rental?.tenant?.contactPerson || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {invoice?.rental?.room?.unitNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                      ${Number(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                          invoice.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                        }`}
                      >
                        {invoice.status.toLowerCase() === "paid" ? (
                          <span className="flex items-center gap-1">
                            <FiCheckCircle className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          "Unpaid"
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm flex justify-end items-center gap-3">
                      {/* Pay Button (Navigate) */}
                      {invoice.status.toLowerCase() !== "paid" && (
                        <button
                          onClick={() =>
                            navigate(`/add-utility-payment/${invoice.id}`)
                          }
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition duration-150"
                          title="Record Payment"
                        >
                          Pay
                        </button>
                      )}

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition duration-150 disabled:opacity-50 disabled:cursor-wait"
                        title="Download PDF Invoice"
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <FiLoader className="animate-spin w-4 h-4" />
                            <span className="hidden sm:inline">
                              Downloading...
                            </span>
                          </>
                        ) : (
                          <>
                            <FiDownload className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-10 text-center">
            No tenant invoices found for {formattedMonth}. Try generating
            charges first.
          </p>
        )}
      </div>
    </div>
  );
}
