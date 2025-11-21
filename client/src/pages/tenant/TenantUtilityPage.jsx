import { useState, useEffect } from "react";
import {
  Droplet,
  Zap,
  Cog,
  Wrench,
  CreditCard,
  Activity,
  DollarSign,
  FileText,
  CheckCircle,
  Building,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import image from "../../assets/Telebirr.png";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../../context/AuthContext";
import {
  DownloadUtilityInvoice,
  payAllUtilityInvoices,
  InvoiceForTenant,
  UtilityInvoiceforTenant,
} from "../../services/utilityService";
import toast from "react-hot-toast";
import { DownloadInvoice } from "../../services/paymentService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UtilityPage = () => {
  const [tenantData, setTenantData] = useState(null);
  const [utilityData, setUtilityData] = useState(null);
  const [selectedRentId, setSelectedRentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedUtilityInvoices, setSelectedUtilityInvoices] = useState([]);
  const [invoiceType, setInvoiceType] = useState(""); // 'rent' or 'utility'
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [paymentFile, setPaymentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantUtilities = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.userId) {
          throw new Error("User not authenticated");
        }
        console.log("🔍 Fetching data for user:", user.userId);
        // Fetch data sequentially to debug which call is failing
        console.log("📞 Calling InvoiceForTenant...");
        const data = await InvoiceForTenant(user.userId);
        console.log("✅ InvoiceForTenant success:", data);

        console.log("📞 Calling UtilityInvoiceforTenant...");
        const utilityData = await UtilityInvoiceforTenant(user.userId);
        console.log("✅ UtilityInvoiceforTenant success:", utilityData);

        setUtilityData(utilityData);
        setTenantData(data);

        if (data.tenant?.rental?.length > 0) {
          setSelectedRentId(data.tenant.rental[0].rentId);
        }
      } catch (err) {
        console.error("❌ Failed to load utility data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          stack: err.stack,
        });
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
        toast.error("Failed to load utility data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchTenantUtilities();
    } else {
      setLoading(false);
      setError("User not authenticated");
    }
  }, [user]);

  const handlePayClick = (invoice, type) => {
    setSelectedInvoice(invoice);
    setInvoiceType(type);

    // For single utility invoice, set it as an array with one element
    if (type === "utility") {
      setSelectedUtilityInvoices([invoice.id]);
    } else {
      setSelectedUtilityInvoices([]);
    }
    setShowPaymentModal(true);
    setPaymentMethod("telebirr");
    setPaymentFile(null);
  };
  const handleDownloadInvoice = async (invoiceId) => {
    const toastId = toast.loading("Downloading invoice...");
    try {
      const data = await DownloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice", { id: toastId });
    }
  };

  const handleDownloadUtilityInvoice = async (invoiceId) => {
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

  const handlePayAllUtilities = async () => {
    const toastId = toast.loading("Preparing combined utility invoice...");
    try {
      if (!user?.userId || !selectedRentId) {
        throw new Error("User or rental selection missing");
      }

      // Get all unpaid utility invoices for the selected rental
      const unpaidUtilityInvoices =
        utilityData?.invoices?.filter(
          (invoice) =>
            invoice.rentId === selectedRentId &&
            invoice.status?.toLowerCase() === "unpaid"
        ) || [];

      if (unpaidUtilityInvoices.length === 0) {
        toast.error("No unpaid utility invoices found", { id: toastId });
        return;
      }

      // Set the selected utility invoices (all unpaid ones)
      setSelectedUtilityInvoices(unpaidUtilityInvoices.map((inv) => inv.id));

      // Calculate total amount
      const totalAmount = unpaidUtilityInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      // Create a combined invoice object
      const combinedInvoice = {
        mergedUtilityInvoiceId: `COMBINED_${Date.now()}`,
        utilityInvoiceIds: unpaidUtilityInvoices.map((inv) => inv.id),
        totalAmount,
        invoiceCount: unpaidUtilityInvoices.length,
        description: `Combined payment for ${unpaidUtilityInvoices.length} utility invoices`,
      };

      setSelectedInvoice(combinedInvoice);
      setInvoiceType("utility");
      setShowPaymentModal(true);

      toast.success(
        `Ready to pay ${unpaidUtilityInvoices.length} utility invoices!`,
        { id: toastId }
      );
    } catch (err) {
      toast.error("Failed to prepare combined utility payment", {
        id: toastId,
      });
      console.error(err);
    }
  };

  const handleSubmitPayment = (method) => {
    if (method === "telebirr") {
      // Handle TeleBirr payment
      console.log("Processing TeleBirr payment for:", selectedInvoice);

      if (invoiceType === "utility" && selectedUtilityInvoices.length > 0) {
        console.log("Utility invoice IDs to pay:", selectedUtilityInvoices);
        // TODO: Call TeleBirr API with selectedUtilityInvoices array
      }

      alert("TeleBirr payment initiated!");
      setShowPaymentModal(false);
    } else if (method === "proof") {
      // Navigate to attach proof page with appropriate parameters
      setShowPaymentModal(false);

      if (invoiceType === "rent") {
        // For rent invoices
        const id = selectedInvoice?.invoiceId;
        navigate(`/tenant/request/invoice/${id}`);
      } else if (invoiceType === "utility") {
        // For utility invoices - pass the array of IDs
        if (selectedUtilityInvoices.length > 0) {
          // Convert array to comma-separated string for URL
          const utilityIdsString = selectedUtilityInvoices.join(",");
          navigate(`/tenant/request/utility?ids=${utilityIdsString}`);
        } else {
          console.error("No utility invoice IDs selected");
          toast.error("No utility invoices selected for payment");
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4">Loading utility data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 text-center text-red-600 dark:text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Data</h2>
        <p className="mb-4">{error}</p>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>User ID: {user?.userId || "Not available"}</p>
          <p>Please check if you're logged in and try again.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data state
  if (!tenantData) {
    return (
      <div className="p-10 text-center text-gray-600 dark:text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>
          No tenant data available. Please check if you have any rental units
          assigned.
        </p>
      </div>
    );
  }

  const selectedRental = tenantData.tenant.rental.find(
    (r) => r.rentId === selectedRentId
  );

  // Get utility invoices for the selected rental
  const utilityInvoices =
    utilityData?.invoices?.filter(
      (invoice) => invoice.rentId === selectedRentId
    ) || [];

  const rentInvoices = selectedRental?.invoices || [];

  // Calculate stats based on utility invoices
  const totalUtilities = utilityInvoices.length;
  const totalPaid = utilityInvoices
    .filter((u) => u.status?.toLowerCase() === "paid")
    .reduce((sum, u) => sum + u.amount, 0);
  const totalUnpaid = utilityInvoices
    .filter((u) => u.status?.toLowerCase() === "unpaid")
    .reduce((sum, u) => sum + u.amount, 0);
  const totalAmount = totalPaid + totalUnpaid;

  const unpaidCount = utilityInvoices.filter(
    (u) => u.status?.toLowerCase() === "unpaid"
  ).length;

  const statsData = [
    {
      title: "Total Utilities",
      value: totalUtilities,
      description: "This month",
      icon: Activity,
    },
    {
      title: "Total Billed",
      value: `ETB ${totalAmount.toLocaleString()}`,
      description: "Overall utility cost",
      icon: DollarSign,
    },
    {
      title: "Paid Amount",
      value: `ETB ${totalPaid.toLocaleString()}`,
      description: "Paid utilities",
      icon: CheckCircle,
    },
    {
      title: "Unpaid Bills",
      value: unpaidCount,
      description: `ETB ${totalUnpaid.toLocaleString()}`,
      icon: CreditCard,
    },
  ];

  const getIconForType = (type) => {
    switch (type) {
      case "Water":
        return Droplet;
      case "Electricity":
        return Zap;
      case "Generator":
        return Cog;
      case "Service":
        return Wrench;
      default:
        return FileText;
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const chartData = {
    labels: utilityInvoices.map((u) => u.utilityCharge?.month || "N/A"),
    datasets: [
      {
        label: "Utility Costs",
        data: utilityInvoices.map((u) => u.amount || 0),
        borderColor: "rgb(124,58,237)",
        backgroundColor: "rgba(124,58,237,0.4)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Utility Cost Trend" },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Billing & Utilities
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your rent payments and utility bills in one place.
        </p>
      </div>

      {tenantData.tenant.rental.length > 0 && (
        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Select Rental Unit
          </label>
          <select
            value={selectedRentId || ""}
            onChange={(e) => setSelectedRentId(Number(e.target.value))}
            className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {tenantData.tenant.rental.map((r) => (
              <option key={r.rentId} value={r.rentId}>
                Unit {r.room?.unitNumber} — ETB {r.rentAmount}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stat.title}
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stat.description}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {utilityInvoices.length > 0 && (
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Utility Invoices Table */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Utility Invoices
          </h2>
          {utilityInvoices.some(
            (inv) => inv.status?.toLowerCase() === "unpaid"
          ) && (
            <button
              onClick={handlePayAllUtilities}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Pay All Unpaid Utilities
            </button>
          )}
        </div>
        <UtilityInvoiceTable
          invoices={utilityInvoices}
          getIcon={getIconForType}
          onPayClick={(invoice) => handlePayClick(invoice, "utility")}
          onDownloadClick={handleDownloadUtilityInvoice}
        />
      </div>

      {/* Rent Invoices Table */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Rent Invoices
        </h2>
        <RentInvoiceTable
          invoices={rentInvoices}
          onPayClick={(invoice) => handlePayClick(invoice, "rent")}
          onDownloadClick={handleDownloadInvoice}
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          selectedInvoice={selectedInvoice}
          invoiceType={invoiceType}
          selectedUtilityInvoices={selectedUtilityInvoices}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
            setSelectedUtilityInvoices([]);
            setPaymentFile(null);
          }}
          onSubmitPayment={handleSubmitPayment}
        />
      )}
    </div>
  );
};

// Utility Invoice Table Component
const UtilityInvoiceTable = ({
  invoices,
  getIcon,
  onPayClick,
  onDownloadClick,
}) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
          <th className="p-2">Type</th>
          <th className="p-2">Month</th>
          <th className="p-2">Amount</th>
          <th className="p-2">Status</th>
          <th className="p-2">Date</th>
          <th className="p-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              No utility invoices available.
            </td>
          </tr>
        )}
        {invoices.map((invoice) => {
          const utilityType = invoice.utilityCharge?.utilityType?.name;
          const Icon = getIcon ? getIcon(utilityType) : null;
          return (
            <tr
              key={invoice.id}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="p-2 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                {utilityType || "Unknown"}
              </td>
              <td className="p-2">{invoice.utilityCharge?.month || "N/A"}</td>
              <td className="p-2">
                ETB {invoice.amount?.toLocaleString() || "0"}
              </td>
              <td
                className={`p-2 font-semibold ${
                  invoice.status?.toLowerCase() === "paid"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {invoice.status || "UNKNOWN"}
              </td>
              <td className="p-2">{formatDate(invoice.createdAt)}</td>
              <td className="p-2 text-right flex gap-2 justify-end">
                {invoice.status?.toLowerCase() === "unpaid" ? (
                  <button
                    onClick={() => onPayClick(invoice)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                  >
                    Pay Now
                  </button>
                ) : (
                  <span className="text-sm text-gray-500">Paid</span>
                )}
                <button
                  onClick={() => onDownloadClick(invoice.id)}
                  className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  Download
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Rent Invoice Table Component
const RentInvoiceTable = ({ invoices, onPayClick, onDownloadClick }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
          <th className="p-2">Invoice Date</th>
          <th className="p-2">Due Date</th>
          <th className="p-2">Total Amount</th>
          <th className="p-2">Status</th>
          <th className="p-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {invoices.length === 0 && (
          <tr>
            <td
              colSpan={5}
              className="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              No rent invoices available.
            </td>
          </tr>
        )}
        {invoices.map((invoice) => (
          <tr
            key={invoice.invoiceId}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td className="p-2">{formatDate(invoice.invoiceDate)}</td>
            <td className="p-2">{formatDate(invoice.dueDate)}</td>
            <td className="p-2">
              ETB {invoice.totalAmount?.toLocaleString() || "0"}
            </td>
            <td
              className={`p-2 font-semibold ${
                invoice.status === "Paid"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {invoice.status || "UNKNOWN"}
            </td>
            <td className="p-2 text-right flex gap-2 justify-end">
              {invoice.status === "Unpaid" ? (
                <button
                  onClick={() => onPayClick(invoice)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                >
                  Pay Now
                </button>
              ) : (
                <span className="text-sm text-gray-500 flex items-center">
                  {invoice.status}
                </span>
              )}
              <button
                onClick={() => onDownloadClick(invoice.invoiceId)}
                className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                Download
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Updated Payment Modal Component
const PaymentModal = ({
  selectedInvoice,
  invoiceType,
  selectedUtilityInvoices,
  onClose,
  onSubmitPayment,
}) => {
  const getAmount = () => {
    if (!selectedInvoice) return 0;

    if (invoiceType === "rent") {
      return selectedInvoice.totalAmount;
    } else {
      return selectedInvoice.amount || selectedInvoice.totalAmount;
    }
  };

  const getTitle = () => {
    if (invoiceType === "rent") {
      return "Rent Payment";
    } else {
      if (selectedUtilityInvoices.length > 1) {
        return `Combined Utilities (${selectedUtilityInvoices.length} invoices)`;
      } else {
        return "Utility Payment";
      }
    }
  };

  const getDescription = () => {
    if (invoiceType === "rent") {
      return "Monthly rent payment";
    } else {
      if (selectedUtilityInvoices.length > 1) {
        return `Payment for ${selectedUtilityInvoices.length} utility invoices`;
      } else {
        return "Utility bill payment";
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {getDescription()}
        </p>

        <div className="text-center mb-8">
          <p className="text-3xl font-bold text-indigo-600">
            ETB {getAmount().toLocaleString()}
          </p>
          {invoiceType === "utility" && selectedUtilityInvoices.length > 1 && (
            <p className="text-sm text-gray-500 mt-2">
              Includes {selectedUtilityInvoices.length} utility invoices
            </p>
          )}
        </div>

        {/* Payment Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* TeleBirr Card */}
          <button
            onClick={() => onSubmitPayment("telebirr")}
            className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-yellow-50 dark:hover:bg-gray-800 transition"
          >
            <img
              src={image}
              alt="TeleBirr Logo"
              className="w-14 h-14 mb-3 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              Pay with TeleBirr
            </span>
          </button>

          {/* Attach Proof Card */}
          <button
            onClick={() => onSubmitPayment("proof")}
            className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3 text-indigo-600 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.364 6.364a4 4 0 105.657 5.657L20.485 13M9 11V7h4"
              />
            </svg>
            <span className="font-medium text-gray-900 dark:text-white">
              Attach Proof
            </span>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UtilityPage;
