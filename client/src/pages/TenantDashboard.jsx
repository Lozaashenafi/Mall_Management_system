import React from "react";
import {
  DollarSign,
  Wrench,
  FileText,
  Bell,
  Activity,
  Clock,
} from "lucide-react";

import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Reusable StatsCard
const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = "",
}) => {
  return (
    <div
      className={`p-5 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col space-y-2 ${className}
      dark:border-gray-700 dark:bg-gray-800`}
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>

      {/* Description / Trend */}
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
};

// Rent Payment Chart
const PaymentChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Payments Made",
        data: [500, 500, 500, 450, 500, 500],
        fill: false,
        borderColor: "rgb(124 58 237)", // purple-600
        backgroundColor: "rgb(124 58 237)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Monthly Rent Payments" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Payment History
      </h2>
      <Line data={data} options={options} />
    </div>
  );
};

// Maintenance Requests Pie Chart
const MaintenanceChart = () => {
  const data = {
    labels: ["Completed", "Pending", "In Progress"],
    datasets: [
      {
        label: "Requests",
        data: [8, 3, 2],
        backgroundColor: ["#4ade80", "#f87171", "#60a5fa"], // green, red, blue
        borderColor: ["#22c55e", "#ef4444", "#3b82f6"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Maintenance Requests" },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Maintenance Overview
      </h2>
      <Pie data={data} options={options} />
    </div>
  );
};

// Recent Activity
const RecentActivity = () => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
      Recent Activity
    </h2>
    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
      <li>Rent payment for September confirmed ✅</li>
      <li>Maintenance request (Leaky faucet) submitted 🔧</li>
      <li>Lease agreement updated 📄</li>
      <li>Notification: Fire drill scheduled 🔔</li>
      <li>Request for room inspection approved 🏠</li>
    </ul>
  </div>
);

const TenantDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent font-extrabold">
            Tenant
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here’s your latest rental overview and updates.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Outstanding Balance"
          value="$250"
          description="Due by Oct 5"
          icon={DollarSign}
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Payments Made"
          value="12"
          description="This year"
          icon={FileText}
          trend={{ value: 10, isPositive: true }}
        />
        <StatsCard
          title="Active Requests"
          value="3"
          description="Pending maintenance"
          icon={Wrench}
          trend={{ value: 1, isPositive: false }}
        />
        <StatsCard
          title="Unread Notifications"
          value="4"
          description="Check your inbox"
          icon={Bell}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart />
        <MaintenanceChart />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <StatsCard
            title="Lease Status"
            value="Active"
            description="Until Dec 2025"
            icon={FileText}
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 
            dark:from-green-900 dark:to-green-800 dark:border-green-700"
          />
          <StatsCard
            title="Avg Response Time"
            value="2 hrs"
            description="Support team"
            icon={Clock}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200
            dark:from-purple-900 dark:to-purple-800 dark:border-purple-700"
          />
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
