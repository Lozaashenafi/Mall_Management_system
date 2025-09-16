import {
  DollarSign,
  BarChart3,
  TrendingUp,
  Filter,
  Calendar,
  Download,
} from "lucide-react";

const reportData = [
  {
    id: "1",
    title: "Sales Report",
    description: "Monthly sales performance and trends",
    type: "Sales",
    lastGenerated: "2024-01-15",
    status: "Ready",
    metrics: { revenue: "$45,250", growth: "+12.5%" },
  },
  {
    id: "2",
    title: "User Analytics",
    description: "User engagement and activity metrics",
    type: "Analytics",
    lastGenerated: "2024-01-14",
    status: "Ready",
    metrics: { users: "2,845", growth: "+8.3%" },
  },
  {
    id: "3",
    title: "Financial Summary",
    description: "Comprehensive financial overview",
    type: "Finance",
    lastGenerated: "2024-01-10",
    status: "Processing",
    metrics: { profit: "$12,680", growth: "+15.2%" },
  },
];

export default function Reports() {
  const getStatusColor = (status) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Sales":
        return (
          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        );
      case "Analytics":
        return (
          <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        );
      case "Finance":
        return (
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download business reports
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100 transition dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100 transition dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: "$127,450",
            growth: "+12.5%",
            growthColor: "text-green-600 dark:text-green-400",
          },
          {
            label: "Active Users",
            value: "8,245",
            growth: "+8.3%",
            growthColor: "text-green-600 dark:text-green-400",
          },
          {
            label: "Conversion Rate",
            value: "3.8%",
            growth: "+0.5%",
            growthColor: "text-green-600 dark:text-green-400",
          },
          {
            label: "Monthly Growth",
            value: "15.2%",
            growth: "+2.1%",
            growthColor: "text-green-600 dark:text-green-400",
          },
        ].map(({ label, value, growth, growthColor }, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <h2 className="text-2xl font-bold mt-1">{value}</h2>
            <p className={`text-xs mt-1 ${growthColor}`}>
              {growth} from last month
            </p>
          </div>
        ))}
      </section>

      {/* Reports List */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition">
        <header className="mb-4">
          <h2 className="text-xl font-semibold">Available Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download comprehensive business reports
          </p>
        </header>

        <div className="space-y-4">
          {reportData.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  {getTypeIcon(report.type)}
                </div>
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      Last generated:{" "}
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </time>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Object.values(report.metrics)[0]}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {Object.values(report.metrics)[1]}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="border border-gray-300 dark:border-gray-700 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    disabled={report.status !== "Ready"}
                    className="border border-gray-300 dark:border-gray-700 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
