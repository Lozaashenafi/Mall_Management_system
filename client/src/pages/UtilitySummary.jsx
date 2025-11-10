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
} from "react-icons/fi";
import {
  DownloadUtilityInvoice,
  generateUtilityCharge,
  getSummaryUtilityCharges,
  getTenantsInvoicesOfMonth,
  getUtilityChargesByMonth,
} from "../services/utilityService";

export default function UtilitySummary() {
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
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

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
      console.log(data);
      setCharges(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch charges");
    }
  };
  const handleDownloadInvoice = async (invoiceId) => {
    const toastId = toast.loading("Preparing your invoice...");

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
    }
  };

  const handleGenerateCharges = async () => {
    if (!month) return toast.error("Please select a month first");
    setGenerating(true);
    try {
      console.log("Sending month:", month);
      const data = await generateUtilityCharge(month);
      console.log(data);
      toast.success(data.message || "Utility charges generated successfully");
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate charges");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchCharges();
    fetchTenantInvoices();
  }, [month]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <FiCalendar className="text-purple-600" />
          Utility Summary
        </h1>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleGenerateCharges}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition duration-300"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" /> Generating...
              </span>
            ) : (
              "Generate Utility Charges"
            )}
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="text-purple-500" /> Monthly Breakdown (
          {month})
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <FiLoader className="animate-spin" /> Loading summary...
            </p>
          </div>
        ) : summary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {summary.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {getUtilityIcon(item.name)} {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-10 text-center">
            No utility expenses recorded for this month.
          </p>
        )}
      </div>
      {/* Utility Charges List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Utility Charges List ({month})
        </h2>

        {charges.length > 0 ? (
          <ul className="space-y-2">
            {charges.map((item) => (
              <li
                key={item.utilityChargeId}
                className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="font-semibold">{item.type}</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ${item.totalCost.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
            No utility charges for this month.
          </p>
        )}
      </div>

      {/* Tenant Invoices Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Tenant Invoices ({month})
        </h2>

        {loadingInvoices ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <FiLoader className="animate-spin" /> Loading invoices...
            </p>
          </div>
        ) : tenantInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tenantInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {invoice?.rental?.tenant?.contactPerson}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {invoice?.rental?.room?.unitNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status.toLowerCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                      {/* ✅ Only show Pay button if not paid */}
                      {invoice.status.toLowerCase() !== "paid" && (
                        <button
                          onClick={() =>
                            navigate(`/add-utility-payment/${invoice.id}`)
                          }
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                          Pay
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <FiLoader className="animate-spin" /> Downloading...
                          </>
                        ) : (
                          <>
                            <FiLoader /> Download
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
            No invoices for this month.
          </p>
        )}
      </div>
    </div>
  );
}

// Helper to show icons for utility types
const getUtilityIcon = (type) => {
  switch (type) {
    case "Water":
      return <FiDroplet className="text-blue-500" />;
    case "Electricity":
      return <FiZap className="text-yellow-500" />;
    case "Generator":
      return <FiCpu className="text-red-500" />;
    case "Service":
      return <FiDollarSign className="text-green-500" />;
    default:
      return <FiDollarSign className="text-gray-500" />;
  }
};
