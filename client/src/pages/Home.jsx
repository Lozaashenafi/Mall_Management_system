import React from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  Building2,
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
        <div
          className="p-2 rounded-md bg-purple-50 text-purple-600 
        dark:bg-purple-900 dark:text-purple-400"
        >
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

      {/* Trend */}
      <div className="flex items-center space-x-1 text-sm font-medium">
        {trend && (
          <>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
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

// Revenue Chart
const RevenueChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 15000, 14000, 17000, 16000, 18000, 19000],
        fill: false,
        borderColor: "rgb(124 58 237)", // Tailwind purple-600
        backgroundColor: "rgb(124 58 237)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Monthly Revenue" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Revenue Chart
      </h2>
      <Line data={data} options={options} />
    </div>
  );
};

// Room Occupancy Pie Chart
const OccupancyChart = () => {
  const data = {
    labels: ["Occupied Rooms", "Vacant Rooms"],
    datasets: [
      {
        label: "Occupancy",
        data: [75, 25], // Example: 75% occupied, 25% vacant
        backgroundColor: ["#4ade80", "#f87171"], // green & red
        borderColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Room Occupancy" },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Room Occupancy
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
      <li>New tenant registered</li>
      <li>Maintenance request submitted</li>
      <li>Lease contract renewed</li>
      <li>Payment received</li>
      <li>Vacant room inspection scheduled</li>
    </ul>
  </div>
);

const Home = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent font-extrabold">
            Mall Admin
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's the latest overview of your mall management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          description="+20.1% from last month"
          icon={DollarSign}
          trend={{ value: 20.1, isPositive: true }}
        />
        <StatsCard
          title="Active Tenants"
          value="120"
          description="+5 new this month"
          icon={Users}
          trend={{ value: 4.3, isPositive: true }}
        />
        <StatsCard
          title="Occupied Rooms"
          value="85%"
          description="Based on total capacity"
          icon={Building2}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatsCard
          title="Pending Requests"
          value="12"
          description="Maintenance & support"
          icon={Activity}
          trend={{ value: -1.2, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <OccupancyChart />
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
            title="System Uptime"
            value="99.9%"
            description="Last 30 days"
            icon={Activity}
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 
            dark:from-green-900 dark:to-green-800 dark:border-green-700"
          />
          <StatsCard
            title="Avg Response Time"
            value="245ms"
            description="API performance"
            icon={Clock}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200
            dark:from-purple-900 dark:to-purple-800 dark:border-purple-700"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
