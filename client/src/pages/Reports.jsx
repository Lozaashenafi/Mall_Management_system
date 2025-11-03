import React, { useEffect, useState } from "react";
import { DollarSign, PieChart, Clock, TrendingUp } from "lucide-react";
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
import { Line, Pie, Bar } from "react-chartjs-2";
import { BarElement } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement, // ✅ add this line
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(value);

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
      {value}
    </p>
  </div>
);

const ReportPage = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Simulating API call (replace with your API later)
    const data = {
      revenue: {
        monthlyRevenue: [{ month: "2025-10", total: 106352 }],
        revenueByUtilityType: [
          { type: "Water", total: 699.99 },
          { type: "Generator", total: 6000 },
          { type: "Electricity", total: 24000 },
          { type: "Service", total: 6999.99 },
        ],
        revenueGrowth: 0,
        totalRevenue: 106352,
      },
      utilities: {
        summary: {
          "2025-10": {
            Water: 700,
            Generator: 6000,
            Electricity: 24000,
            Service: 7000,
          },
        },
        comparison: {
          totalCost: 37700,
          totalPaid: 37699.98,
          difference: 0.02,
        },
      },
      maintenance: {
        summary: [],
        avgResolveTime: { _avg: { resolveTimeHours: 0 } },
      },
      notifications: [
        { channel: "System", type: "Maintenance", count: 13 },
        { channel: "System", type: "Invoice", count: 2 },
        { channel: "System", type: "PaymentReminder", count: 4 },
        { channel: "System", type: "OverduePayment", count: 1 },
        { channel: "Email", type: "OverduePayment", count: 1 },
      ],
      contracts: {
        renewals: 0,
        terminations: 0,
        avgDuration: { _avg: { durationMonths: 0 } },
      },
    };
    setReport(data);
  }, []);

  if (!report) return <p className="p-6">Loading report...</p>;

  // 🎯 Revenue Chart
  const revenueTrend = {
    labels: report.revenue.monthlyRevenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue (ETB)",
        data: report.revenue.monthlyRevenue.map((r) => r.total),
        borderColor: "#7C3AED",
        backgroundColor: "#7C3AED",
        tension: 0.3,
      },
    ],
  };

  // 🧾 Utility Revenue Pie
  const utilityChart = {
    labels: report.revenue.revenueByUtilityType.map((u) => u.type),
    datasets: [
      {
        data: report.revenue.revenueByUtilityType.map((u) => u.total),
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
      },
    ],
  };

  // 🔔 Notifications Bar
  const notificationChart = {
    labels: report.notifications.map((n) => `${n.type} (${n.channel})`),
    datasets: [
      {
        label: "Notifications",
        data: report.notifications.map((n) => n.count),
        backgroundColor: "#6366F1",
      },
    ],
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Monthly Report Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Summary of financial, operational, and maintenance activities.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(report.revenue.totalRevenue)}
          icon={DollarSign}
          color="bg-indigo-600"
        />
        <StatsCard
          title="Revenue Growth"
          value={`${report.revenue.revenueGrowth}%`}
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatsCard
          title="Total Utility Cost"
          value={formatCurrency(report.utilities.comparison.totalCost)}
          icon={PieChart}
          color="bg-amber-600"
        />
        <StatsCard
          title="Avg Resolve Time"
          value={`${report.maintenance.avgResolveTime._avg.resolveTimeHours} hr`}
          icon={Clock}
          color="bg-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          <Line data={revenueTrend} />
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Revenue by Utility Type
          </h2>
          <Pie data={utilityChart} />
        </div>
      </div>

      {/* Notifications + Contract Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Notifications Summary</h2>
          <Bar data={notificationChart} />
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Contract Overview</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Renewals:</strong> {report.contracts.renewals}
            </li>
            <li>
              <strong>Terminations:</strong> {report.contracts.terminations}
            </li>
            <li>
              <strong>Average Duration:</strong>{" "}
              {report.contracts.avgDuration._avg.durationMonths} months
            </li>
          </ul>
        </div>
      </div>

      {/* Utilities Summary */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          Utility Summary (2025-10)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {Object.entries(report.utilities.summary["2025-10"]).map(
            ([type, cost]) => (
              <div
                key={type}
                className="flex flex-col items-center p-3 border rounded-lg dark:border-gray-700"
              >
                <span className="font-semibold">{type}</span>
                <span>{formatCurrency(cost)}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
