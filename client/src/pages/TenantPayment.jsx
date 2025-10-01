import React from "react";
import { DollarSign, Clock, FileText, Send, Activity } from "lucide-react";
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

// Reusable StatsCard
const StatsCard = ({ title, value, description, icon: Icon, trend }) => (
  <div
    className="p-5 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg 
      dark:border-gray-700 dark:bg-gray-800 flex flex-col space-y-2"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
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

// Payment History Chart
const PaymentHistoryChart = () => {
  const data = {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      {
        label: "Payments Made",
        data: [500, 500, 450, 500, 0], // last month missing
        borderColor: "rgb(124 58 237)",
        backgroundColor: "rgb(124 58 237)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Payment History" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Line data={data} options={options} />
    </div>
  );
};

// Upcoming Payment
const UpcomingPayment = () => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
      Upcoming Payment
    </h2>
    <p className="text-gray-700 dark:text-gray-300">Amount Due: $500</p>
    <p className="text-gray-700 dark:text-gray-300">Due Date: Oct 5, 2025</p>
    <button className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700">
      Pay Now
    </button>
  </div>
);

// Payment Requests
const PaymentRequests = () => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
      Payment Requests
    </h2>
    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
      <li className="flex justify-between">
        <span>Request #1 - Rent Adjustment</span>
        <span className="text-sm text-yellow-500">Pending</span>
      </li>
      <li className="flex justify-between">
        <span>Request #2 - Late Fee Waiver</span>
        <span className="text-sm text-green-500">Approved</span>
      </li>
      <li className="flex justify-between">
        <span>Request #3 - Partial Payment</span>
        <span className="text-sm text-red-500">Rejected</span>
      </li>
    </ul>
    <button className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 flex items-center gap-2">
      <Send className="w-4 h-4" /> New Request
    </button>
  </div>
);

// Recent Payment Activity
const RecentPayments = () => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
      Recent Payment Activity
    </h2>
    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
      <li>✅ $500 Rent Payment - Sep 5, 2025</li>
      <li>✅ $500 Rent Payment - Aug 5, 2025</li>
      <li>❌ Late Fee Unpaid - Jul 10, 2025</li>
      <li>✅ $500 Rent Payment - Jun 5, 2025</li>
    </ul>
  </div>
);

const TenantPayment = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Payment Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your rent payments, upcoming dues, and requests here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Outstanding Balance"
          value="$250"
          description="Due by Oct 5"
          icon={DollarSign}
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Next Payment"
          value="$500"
          description="Oct 5, 2025"
          icon={Clock}
        />
        <StatsCard
          title="Total Paid"
          value="$6,000"
          description="This year"
          icon={FileText}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Requests Made"
          value="3"
          description="Payment-related"
          icon={Send}
        />
      </div>

      {/* Charts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentHistoryChart />
        <UpcomingPayment />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentRequests />
        <RecentPayments />
      </div>
    </div>
  );
};

export default TenantPayment;
