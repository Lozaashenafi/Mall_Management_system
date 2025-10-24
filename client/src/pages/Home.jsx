import React, { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Building2,
  FileText,
  Wrench,
  Package,
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
import { getDashboardData } from "../services/dashboardService";

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

const getStatusColorClass = (status) => {
  switch (status) {
    case "Paid":
    case "Occupied":
    case "Completed":
    case "Active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Unpaid":
    case "Maintenance":
    case "InProgress":
    case "Expired":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Overdue":
    case "Vacant":
    case "Pending":
    case "Terminated":
    case "Inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

const StatsCard = ({ title, value, description, icon: Icon }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-purple-50 text-purple-600 rounded-md dark:bg-purple-900 dark:text-purple-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {value}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const OperationalSnapshot = ({ title, icon: Icon, data, total }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-2 mb-4">
      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
    </div>
    <ul className="space-y-3">
      {Object.entries(data).map(([status, count]) => (
        <li key={status} className="flex justify-between text-sm">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
              status
            )}`}
          >
            {status}
          </span>
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {count}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({((count / total) * 100).toFixed(1)}%)
            </span>
          </div>
        </li>
      ))}
    </ul>
    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 text-sm font-medium flex justify-between">
      <span>Total:</span>
      <span>{total}</span>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: data.map((item) => item.revenue),
        fill: false,
        borderColor: "rgb(124 58 237)",
        backgroundColor: "rgb(124 58 237)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Monthly Revenue Trend
      </h2>
      <Line data={chartData} />
    </div>
  );
};

// 🟣 Room Occupancy Pie Chart (with real API data)
const OccupancyChart = ({ data, total }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Rooms",
        data: values,
        backgroundColor: ["#10b981", "#f97316", "#eab308", "#ef4444"],
        borderColor: ["#059669", "#ea580c", "#ca8a04", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Room Occupancy Overview ({data.Occupied || 0}/{total})
      </h2>
      <div className="max-w-xs mx-auto">
        <Pie data={chartData} options={options} />
      </div>
      <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
        Total Units: {total}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (!dashboard)
    return <p className="p-6 text-red-500">Failed to load data</p>;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Mall Management Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A unified view of key financial and operational metrics.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Rooms"
          value={dashboard.rooms.total}
          description="Current active rooms"
          icon={Building2}
        />
        <StatsCard
          title="Active Rentals"
          value={dashboard.rentals.total}
          description="Ongoing leases"
          icon={Package}
        />

        <StatsCard
          title="Maintenance Tasks"
          value={dashboard.maintenance.total}
          description="Pending or in-progress"
          icon={Wrench}
        />

        <StatsCard
          title="Total Revenue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
            minimumFractionDigits: 2,
          }).format(dashboard.totalRevenue)}
          description="Total income from all invoices"
          icon={DollarSign}
        />
      </div>

      {/* Snapshot + Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={dashboard.revenueTrend} />
        <OccupancyChart
          data={dashboard.rooms.data}
          total={dashboard.rooms.total}
        />
      </section>

      {/* Detailed Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationalSnapshot {...dashboard.rooms} icon={Building2} />
        <OperationalSnapshot {...dashboard.rentals} icon={Package} />
        <OperationalSnapshot {...dashboard.invoices} icon={FileText} />
        <OperationalSnapshot {...dashboard.maintenance} icon={Wrench} />
      </section>
    </div>
  );
};

export default Dashboard;
