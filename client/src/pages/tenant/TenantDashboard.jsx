import React, { useEffect, useState } from "react";
import { DollarSign, Wrench, FileText, Bell, Activity } from "lucide-react";
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
import { getTenantDashboard } from "../../services/dashboardService";

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
const StatsCard = ({ title, value, description, icon: Icon, trend }) => {
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col space-y-2 dark:border-gray-700 dark:bg-gray-800">
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
      {description && (
        <span className="text-gray-600 dark:text-gray-400">{description}</span>
      )}
      {trend && (
        <div className="flex items-center space-x-1 text-sm font-medium">
          <Activity
            className={`w-4 h-4 ${
              trend.isPositive ? "text-green-500" : "text-red-500 rotate-180"
            }`}
          />
          <span
            className={`${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
};

// Payment History Chart
const PaymentChart = ({ paymentTrend }) => {
  const data = {
    labels: paymentTrend.map((p) => p.month),
    datasets: [
      {
        label: "Payments Made",
        data: paymentTrend.map((p) => p.amount),
        fill: false,
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
      title: { display: true, text: "Monthly Rent Payments" },
    },
    scales: { y: { beginAtZero: true } },
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

// Maintenance Chart
const MaintenanceChart = ({ maintenanceStatus }) => {
  const statuses = ["Completed", "Pending", "InProgress"];
  const data = {
    labels: statuses,
    datasets: [
      {
        label: "Requests",
        data: statuses.map((s) => maintenanceStatus[s] || 0),
        backgroundColor: ["#4ade80", "#f87171", "#60a5fa"],
        borderColor: ["#22c55e", "#ef4444", "#3b82f6"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Maintenance Overview" },
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

// Tenant Dashboard Component
const TenantDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.userId;
        const data = await getTenantDashboard(userId);
        setDashboard(data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);

  if (!dashboard) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Welcome */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Outstanding Balance"
          value={`$${dashboard.outstandingBalance.toLocaleString()}`}
          description={`Due by ${new Date(
            dashboard.leaseEnd
          ).toLocaleDateString()}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Payments Made"
          value={dashboard.paymentsMade}
          description="This year"
          icon={FileText}
        />
        <StatsCard
          title="Active Requests"
          value={dashboard.activeRequests}
          description="Pending maintenance"
          icon={Wrench}
        />
        <StatsCard
          title="Unread Notifications"
          value={dashboard.unreadNotifications}
          description="Check your inbox"
          icon={Bell}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart paymentTrend={dashboard.paymentTrend} />
        <MaintenanceChart maintenanceStatus={dashboard.maintenanceStatus} />
      </div>

      {/* Lease Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Lease Status"
          value={dashboard.leaseStatus}
          description={`Until ${new Date(
            dashboard.leaseEnd
          ).toLocaleDateString()}`}
          icon={FileText}
          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700"
        />
      </div>
    </div>
  );
};

export default TenantDashboard;
