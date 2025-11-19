import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  FileText,
  Send,
  Activity,
  CreditCard,
  CheckCircle,
} from "lucide-react";
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

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Reusable StatsCard ---
const StatsCard = ({ title, value, description, icon: Icon, trend }) => (
  <div
    className="p-5 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg 
      dark:border-gray-700 dark:bg-gray-800 flex flex-col space-y-2"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>

    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
      {value}
    </p>

    <div className="flex items-center space-x-1 text-sm font-medium">
      {trend && (
        <>
          {trend.isPositive ? (
            <Activity className="w-4 h-4 text-green-500" />
          ) : (
            <Activity className="w-4 h-4 text-red-500 rotate-180" />
          )}
          <span
            className={`${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.value}%
          </span>
        </>
      )}
      <span className="text-gray-600 dark:text-gray-400">{description}</span>
    </div>
  </div>
);

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Paid":
    case "Confirmed":
      return "text-green-600 dark:text-green-400";
    case "Unpaid":
    case "Pending":
      return "text-yellow-600 dark:text-yellow-400";
    case "Overdue":
    case "Failed":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

// --- PaymentRequests Component ---
const PaymentRequests = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRentId, setSelectedRentId] = useState(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("rentals");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setRentals(parsed);
        if (parsed.length > 0) setSelectedRentId(parsed[0].rentId);
      }
    } catch (e) {
      console.error("Error loading payment data from localStorage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-600 dark:text-gray-400">
        Loading payment data...
      </div>
    );
  }

  const selectedRental = rentals.find((r) => r.rentId === selectedRentId);

  const allInvoices = selectedRental?.invoices || [];
  const allPayments = allInvoices.flatMap((inv) => inv.payments || []);

  const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalInvoiced = allInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  );
  const outstandingBalance = totalInvoiced - totalPaid;
  // Today
  const today = new Date();
  const user = JSON.parse(localStorage.getItem("user"));
  // 1. Get all unpaid invoices
  let unpaidInvoices = allInvoices
    .filter((inv) => inv.status !== "Paid")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // 2. Determine next payment
  let nextPayment = null;

  if (unpaidInvoices.length > 0) {
    // Take the earliest unpaid invoice
    nextPayment = unpaidInvoices[0];
  } else if (allPayments.length > 0) {
    // No unpaid invoices, calculate next expected payment from last payment's end date
    const lastPayment = allPayments.reduce((latest, p) => {
      const date = new Date(p.endDate || p.paymentDate);
      return !latest || date > new Date(latest.endDate || latest.paymentDate)
        ? p
        : latest;
    }, null);

    const nextExpectedDate = new Date(
      lastPayment.endDate || lastPayment.paymentDate
    );
    nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 1); // assume monthly

    nextPayment = {
      totalAmount: selectedRental?.rentAmount || 0,
      dueDate: nextExpectedDate,
      invoiceId: "Expected",
      paperInvoiceNumber: "N/A",
      isExpected: true,
    };
  } else {
    // No payments made yet → use rental start date
    const startDate = new Date(selectedRental.startDate);
    nextPayment = {
      totalAmount: selectedRental?.rentAmount || 0,
      dueDate: startDate,
      invoiceId: "First Payment",
      paperInvoiceNumber: "N/A",
      isExpected: true,
    };
  }

  // 3. Check if overdue
  if (nextPayment && new Date(nextPayment.dueDate) < today) {
    nextPayment.isOverdue = true;
    nextPayment.daysOverdue = Math.ceil(
      (today - new Date(nextPayment.dueDate)) / (1000 * 60 * 60 * 24)
    );
  }

  // Stats Data
  const statsData = [
    {
      title: "Outstanding Balance",
      value: `$${outstandingBalance.toFixed(2)}`,
      description:
        outstandingBalance > 0 ? `Total unpaid invoices` : "You're all clear!",
      icon: DollarSign,
      trend: { value: 0, isPositive: outstandingBalance <= 0 },
    },
    {
      title: "Next Due Date",
      value: nextPayment
        ? `$${(nextPayment.totalAmount || 0).toFixed(2)}`
        : "None",
      description: nextPayment
        ? `Invoice ${nextPayment.paperInvoiceNumber || nextPayment.invoiceId}`
        : "No upcoming dues.",
      icon: Clock,
    },
    {
      title: "Total Paid",
      value: `$${totalPaid.toFixed(2)}`,
      description: `Across ${allPayments.length} transactions`,
      icon: FileText,
      trend: { value: 10, isPositive: true },
    },
    {
      title: "Total Invoices",
      value: `${allInvoices.length}`,
      description: "Rent & Utilities",
      icon: CreditCard,
    },
  ];

  // Chart Data
  const chartData = {
    labels: allPayments
      .map((p) => formatDate(p.paymentDate))
      .slice(0, 5)
      .reverse(),
    datasets: [
      {
        label: "Payments Made",
        data: allPayments
          .map((p) => p.amount)
          .slice(0, 5)
          .reverse(),
        borderColor: "rgb(124 58 237)",
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Recent Payments Trend" },
    },
    scales: { y: { beginAtZero: true } },
  };

  // --- Components ---
  const PaymentHistoryChart = () => (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Payment Trend
      </h2>
      {allPayments.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="text-center p-5 text-gray-500 dark:text-gray-400">
          No payment data available for chart.
        </div>
      )}
    </div>
  );
  const TenantPaymentRequests = () => {
    const tenantPaymentRequests = user?.rentals?.flatMap((rental) => {
      const rentRequests =
        rental.invoices?.flatMap((inv) => inv.paymentRequest || []) || [];
      const utilityRequests =
        rental.utilityInvoices?.flatMap((ui) => ui.paymentRequest || []) || [];
      return [...rentRequests, ...utilityRequests];
    });
    return (
      <div className="mt-6 p-5 rounded-xl border bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Your Payment Requests</h2>
        {tenantPaymentRequests.length === 0 ? (
          <p className="text-gray-500">No payment requests submitted yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {tenantPaymentRequests.map((req) => (
              <li key={req.requestId} className="py-2 flex justify-between">
                <span>
                  ${req.amount.toLocaleString()} via {req.method}{" "}
                  {req.reference && `(${req.reference})`}
                </span>
                <span
                  className={`font-semibold ${
                    req.status === "Pending"
                      ? "text-yellow-600"
                      : req.status === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {req.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const UpcomingPayment = () => (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Upcoming Payment
      </h2>
      {nextPayment ? (
        <div className="space-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Amount Due:</strong> ${nextPayment.totalAmount.toFixed(2)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Due Date:</strong> {formatDate(nextPayment.dueDate)}
            {nextPayment.isOverdue && (
              <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                ⚠️ Overdue by {nextPayment.daysOverdue} day
                {nextPayment.daysOverdue > 1 ? "s" : ""}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {nextPayment.isExpected
              ? nextPayment.isOverdue
                ? "You have missed your payment. Please pay immediately!"
                : "Payment expected based on your last payment cycle."
              : `Invoice: ${
                  nextPayment.paperInvoiceNumber || nextPayment.invoiceId
                } for Unit ${selectedRental?.room?.unitNumber || "N/A"}`}
          </p>
          <button
            className={`mt-4 px-4 py-2 rounded-lg font-medium ${
              nextPayment.isOverdue
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Pay Now
          </button>
        </div>
      ) : (
        <div className="text-green-600 dark:text-green-400 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> No immediate payments due.
        </div>
      )}
    </div>
  );

  const RecentPaymentActivity = () => (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Recent Payment Activity
      </h2>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {allPayments.slice(0, 5).map((p, index) => (
          <li
            key={index}
            className="py-2 flex justify-between items-center text-gray-700 dark:text-gray-300"
          >
            <span className="flex-1">
              {p.status === "Confirmed" ? "✅" : "⏳"} $
              {p.amount.toLocaleString()} via {p.method}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(p.paymentDate)} (Unit{" "}
              {selectedRental?.room?.unitNumber})
            </span>
          </li>
        ))}
        {allPayments.length === 0 && (
          <li className="text-center py-4 text-gray-500">
            No payments recorded yet.
          </li>
        )}
      </ul>
    </div>
  );

  const InvoiceHistory = () => (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Invoice History
      </h2>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {allInvoices.slice(0, 5).map((inv, index) => (
          <li
            key={index}
            className="py-2 flex justify-between items-center text-gray-700 dark:text-gray-300"
          >
            <span className="flex-1">
              <FileText className="w-4 h-4 inline mr-2 text-gray-500" />
              Invoice <strong>{inv.paperInvoiceNumber || inv.invoiceId}</strong>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                (Unit {selectedRental?.room?.unitNumber})
              </span>
            </span>
            <span
              className={`font-semibold ${getStatusColor(
                inv.status
              )} min-w-[70px] text-right`}
            >
              {inv.status}
            </span>
          </li>
        ))}
        {allInvoices.length === 0 && (
          <li className="text-center py-4 text-gray-500">
            No invoices generated yet.
          </li>
        )}
      </ul>
      <button className="mt-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
        <Send className="w-4 h-4" /> View All Invoices
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Payment Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your rent payments, upcoming dues, and invoice history
          dynamically.
        </p>
      </div>

      {/* Rental Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
          Select Rental
        </label>
        <select
          value={selectedRentId || ""}
          onChange={(e) => setSelectedRentId(Number(e.target.value))}
          className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {rentals.map((r) => (
            <option key={r.rentId} value={r.rentId}>
              Unit {r.room?.unitNumber} (Rent: ${r.rentAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentHistoryChart />
        <UpcomingPayment />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceHistory />
        <RecentPaymentActivity />
      </div>
      <div className="mt-6">
        <TenantPaymentRequests />
      </div>
    </div>
  );
};

export default PaymentRequests;
