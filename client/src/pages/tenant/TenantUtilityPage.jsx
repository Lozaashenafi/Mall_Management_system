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
  utilityForTenant,
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
  const [selectedRentId, setSelectedRentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [paymentFile, setPaymentFile] = useState(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantUtilities = async () => {
      try {
        const data = await utilityForTenant(user.userId);
        setTenantData(data);
        if (data.tenant?.rental?.length > 0) {
          setSelectedRentId(data.tenant.rental[0].rentId);
        }
      } catch (err) {
        console.error("Failed to load utility data:", err);
      }
    };
    if (user?.userId) fetchTenantUtilities();
  }, [user]);

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
    setPaymentMethod("telebirr");
    setPaymentFile(null);
  };
  const handleDownloadInvoice = async (invoiceId) => {
    const toastId = toast.loading("Downloading invoice...");

    try {
      const data = await DownloadInvoice(invoiceId);

      // create a download link
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
  const handleSubmitPayment = async () => {
    try {
      console.log("Paying invoice:", selectedInvoice.invoiceId);
      console.log("Payment method:", paymentMethod);
      console.log("Payment file:", paymentFile);

      // TODO: call backend API here

      alert("Payment submitted successfully!");
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentFile(null);
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed, try again.");
    }
  };

  if (!tenantData)
    return (
      <div className="p-10 text-center text-gray-600 dark:text-gray-400">
        Loading utility data...
      </div>
    );
  const selectedRental = tenantData.tenant.rental.find(
    (r) => r.rentId === selectedRentId
  );

  const utilityInvoices = selectedRental?.utilityInvoices || [];
  const rentInvoices = selectedRental?.invoices || [];

  const totalUtilities = utilityInvoices.length;
  const totalPaid = utilityInvoices
    .filter((u) => u.status.toLowerCase() === "paid")
    .reduce((sum, u) => sum + u.amount, 0);
  const totalUnpaid = utilityInvoices
    .filter((u) => u.status.toLowerCase() === "unpaid")
    .reduce((sum, u) => sum + u.amount, 0);
  const totalAmount = totalPaid + totalUnpaid;

  const unpaidCount = utilityInvoices.filter(
    (u) => u.status.toLowerCase() === "unpaid"
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
    labels: utilityInvoices.map((u) => u.utilityCharge.month),
    datasets: [
      {
        label: "Utility Costs",
        data: utilityInvoices.map((u) => u.amount),
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
          Utility Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your electricity, water, service, and generator bills here.
        </p>
      </div>

      {/* Rental Selector */}
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
      <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Utility Invoices Table */}
      <InvoiceTable
        title="Utility Invoices"
        invoices={utilityInvoices}
        getIcon={getIconForType}
        onPayClick={handlePayClick}
        onUtilityDownloadClick={handleDownloadUtilityInvoice}
      />

      {/* Rent Invoices Table */}
      <InvoiceTable
        title="Rent Invoices"
        invoices={rentInvoices}
        getIcon={() => null}
        onPayClick={handlePayClick}
        onDownloadClick={handleDownloadInvoice}
        isRent
      />

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
              Total Payment
            </h2>

            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-indigo-600">
                ETB{" "}
                {selectedInvoice?.totalAmount?.toLocaleString() ||
                  selectedInvoice?.amount?.toLocaleString()}
              </p>
            </div>

            {/* Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* TeleBirr Card */}
              <button
                onClick={() => {
                  setPaymentMethod("telebirr");
                  handleSubmitPayment("telebirr");
                }}
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
                onClick={() => {
                  setShowPaymentModal(false);

                  // Determine type
                  const type = selectedInvoice?.invoiceId
                    ? "invoice"
                    : "utility";
                  const id = selectedInvoice?.invoiceId || selectedInvoice?.id;

                  navigate(`/tenant/request/${type}/${id}`);
                }}
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setPaymentFile(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Invoice Table Component
const InvoiceTable = ({
  title,
  invoices,
  getIcon,
  onDownloadClick, // <-- add this
  onUtilityDownloadClick,
  onPayClick,
  isRent = false,
}) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
            {isRent ? (
              <>
                <th className="p-2">Invoice Date</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Total Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Action</th>
              </>
            ) : (
              <>
                <th className="p-2">Type</th>
                <th className="p-2">Month</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
                <th className="p-2 text-right">Action</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr>
              <td
                colSpan={isRent ? 5 : 6}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                No invoices available.
              </td>
            </tr>
          )}
          {invoices.map((inv, idx) => {
            const Icon = getIcon ? getIcon(inv.utilityCharge?.type) : null;
            return (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {isRent ? (
                  <>
                    <td className="p-2">{formatDate(inv.invoiceDate)}</td>
                    <td className="p-2">{formatDate(inv.dueDate)}</td>
                    <td className="p-2">
                      ETB {inv.totalAmount.toLocaleString()}
                    </td>
                    <td
                      className={`p-2 font-semibold ${
                        inv.status === "Paid"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {inv.status}
                    </td>
                    <td className="p-2 text-right flex gap-2 justify-end">
                      {inv.status === "Unpaid" ? (
                        <button
                          onClick={() => onPayClick(inv)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 flex items-center">
                          Paid
                        </span>
                      )}

                      <button
                        onClick={() => onDownloadClick(inv.invoiceId)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 flex items-center gap-2">
                      {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                      {inv.utilityCharge?.type}
                    </td>
                    <td className="p-2">{inv.utilityCharge?.month}</td>
                    <td className="p-2">ETB {inv.amount.toLocaleString()}</td>
                    <td
                      className={`p-2 font-semibold ${
                        inv.status.toLowerCase() === "paid"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {inv.status}
                    </td>
                    <td className="p-2">{formatDate(inv.createdAt)}</td>

                    <td className="p-2 text-right flex gap-2 justify-end">
                      {inv.status.toLowerCase() === "unpaid" ? (
                        <button
                          onClick={() => onPayClick(inv)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">Paid</span>
                      )}
                      <button
                        onClick={() => onUtilityDownloadClick(inv.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UtilityPage;
