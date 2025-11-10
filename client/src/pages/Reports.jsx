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
  BarElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import { getReportsData } from "../services/reportService"; // ✅ use your function

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
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
    const fetchReport = async () => {
      try {
        const res = await getReportsData();
        const data = res.data;
        // Only set report if there is real data
        setReport(data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
      }
    };
    fetchReport();
  }, []);

  if (!report) return <p className="p-6">No report data available.</p>;

  // Revenue Trend Chart
  const revenueTrend =
    report.revenue.monthlyRevenue?.length > 0
      ? {
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
        }
      : null;

  // Utility Revenue Pie Chart
  const utilityChart =
    report.revenue.revenueByUtilityType?.length > 0
      ? {
          labels: report.revenue.revenueByUtilityType.map((u) => u.type),
          datasets: [
            {
              data: report.revenue.revenueByUtilityType.map((u) => u.total),
              backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
            },
          ],
        }
      : null;

  // Notifications Bar Chart
  const notificationChart =
    report.notifications?.length > 0
      ? {
          labels: report.notifications.map((n) => `${n.type} (${n.channel})`),
          datasets: [
            {
              label: "Notifications",
              data: report.notifications.map((n) => n.count),
              backgroundColor: "#6366F1",
            },
          ],
        }
      : null;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Monthly Report Overview</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {report.revenue.totalRevenue > 0 && (
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(report.revenue.totalRevenue)}
            icon={DollarSign}
            color="bg-indigo-600"
          />
        )}
        {report.revenue.revenueGrowth !== 0 && (
          <StatsCard
            title="Revenue Growth"
            value={`${report.revenue.revenueGrowth}%`}
            icon={TrendingUp}
            color="bg-green-600"
          />
        )}
        {report.utilities.comparison.totalCost > 0 && (
          <StatsCard
            title="Total Utility Cost"
            value={formatCurrency(report.utilities.comparison.totalCost)}
            icon={PieChart}
            color="bg-amber-600"
          />
        )}
        {report.maintenance.avgResolveTime._avg.resolveTimeHours > 0 && (
          <StatsCard
            title="Avg Resolve Time"
            value={`${report.maintenance.avgResolveTime._avg.resolveTimeHours} hr`}
            icon={Clock}
            color="bg-blue-600"
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueTrend && (
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Monthly Revenue Trend
            </h2>
            <Line data={revenueTrend} />
          </div>
        )}

        {utilityChart && (
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Revenue by Utility Type
            </h2>
            <Pie data={utilityChart} />
          </div>
        )}
      </div>

      {/* Notifications */}
      {notificationChart && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Notifications Summary</h2>
          <Bar data={notificationChart} />
        </div>
      )}
    </div>
  );
};

export default ReportPage;
