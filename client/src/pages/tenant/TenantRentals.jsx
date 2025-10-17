import React, { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

// --- Reusable StatsCard Component (kept from previous example) ---
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 flex items-center justify-between">
    <div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// --- Helper Functions (kept from previous example) ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  // The Z in the string means UTC, so we use toLocaleDateString without UTC to get local time display.
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRentalStatusDisplay = (status) => {
  switch (status) {
    case "Active":
      return {
        icon: CheckCircle,
        color: "text-green-600 bg-green-100 dark:bg-green-900/50",
        text: "Active",
      };
    case "Expired":
      return {
        icon: AlertTriangle,
        color: "text-red-600 bg-red-100 dark:bg-red-900/50",
        text: "Expired",
      };
    case "Terminated":
      return {
        icon: AlertTriangle,
        color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50",
        text: "Terminated",
      };
    default:
      return {
        icon: Clock,
        color: "text-gray-600 bg-gray-100 dark:bg-gray-900/50",
        text: status || "Unknown",
      };
  }
};

const getDaysRemaining = (endDateString) => {
  if (!endDateString) return 0;
  const end = new Date(endDateString);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// --- Main Dynamic Component ---
const TenantRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("rentals");
      if (storedData) {
        // Parse the JSON data
        const parsedRentals = JSON.parse(storedData);

        // Assuming the data is an array of rental objects
        if (Array.isArray(parsedRentals)) {
          setRentals(parsedRentals);
        } else {
          // If the data isn't an array, log an error or handle it
          console.error(
            "Data retrieved from localStorage is not an array:",
            parsedRentals
          );
          setRentals([]); // Fallback to empty array
        }
      } else {
        console.log("No tenantRentalsData found in localStorage.");
        // Optional: If no data is found, perhaps load a fallback or show an empty state immediately
      }
    } catch (e) {
      console.error("Error parsing data from localStorage:", e);
      setRentals([]); // Fallback on parsing error
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    // Simple jank loading state
    return (
      <div className="p-10 text-center text-lg text-gray-600 dark:text-gray-400">
        Loading rental data...
      </div>
    );
  }

  const activeRentals = rentals.filter((r) => r.status === "Active");
  const totalRentals = rentals.length;
  const totalMonthlyRent = activeRentals.reduce(
    (sum, rental) => sum + (rental.rentAmount || 0),
    0
  );

  if (totalRentals === 0) {
    return (
      <div className="p-10 text-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300">
        <p className="font-semibold">
          <Info className="inline w-5 h-5 mr-2" />
          No rental agreements found for this tenant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          Your Rental Agreements 🏢
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Overview of your current and past property agreements.
        </p>
      </header>

      {/* --- */}
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Active Rentals"
          value={activeRentals.length}
          icon={ClipboardList}
          color="bg-purple-600"
        />
        <StatsCard
          title="Total Monthly Rent"
          value={`$${totalMonthlyRent.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatsCard
          title="Total Agreements"
          value={totalRentals}
          icon={FileText}
          color="bg-red-600"
        />
      </div>

      {/* --- */}
      {/* Active Rentals List */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Current Active Rentals
      </h2>
      {activeRentals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeRentals.map((rental) => {
            const unitNumber = rental.room?.unitNumber || "N/A";
            const roomType = rental.room?.roomType?.typeName || "Room"; // Assuming roomType is nested under room

            return (
              <div
                key={rental.rentId}
                className="p-6 rounded-xl border border-purple-300 bg-white shadow-lg dark:border-purple-700 dark:bg-gray-800 transition hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100 dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 flex items-center">
                    <Home className="w-6 h-6 mr-2" />
                    Unit {unitNumber}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ID: {rental.rentId}
                  </span>
                </div>

                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Type:
                    </span>{" "}
                    {roomType}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Rent Amount:
                    </span>{" "}
                    ${(rental.rentAmount || 0).toLocaleString()} /{" "}
                    {rental.paymentInterval}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Lease Term:
                    </span>{" "}
                    {formatDate(rental.startDate)} -{" "}
                    {formatDate(rental.endDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Rent Due Day:
                    </span>{" "}
                    {rental.paymentDueDate}th
                  </p>
                  <p
                    className={`flex items-center text-sm font-medium ${
                      getDaysRemaining(rental.endDate) < 60
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {getDaysRemaining(rental.endDate).toLocaleString()} days
                    until expiry
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300">
          <p className="font-semibold">
            <AlertTriangle className="inline w-5 h-5 mr-2" />
            No Active Rental Agreements Found.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------------------------------------------------- */}

      {/* All Rental History List */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          All Agreement History
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {rentals.map((r) => {
              const statusDisplay = getRentalStatusDisplay(r.status);
              const unitNumber = r.room?.unitNumber || "N/A";
              const roomType = r.room?.roomType?.typeName || "Room";

              return (
                <li
                  key={r.rentId}
                  className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Unit: {unitNumber} ({roomType})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      ${(r.rentAmount || 0).toLocaleString()} /{" "}
                      {r.paymentInterval?.toLowerCase() || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDate(r.startDate)} to {formatDate(r.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statusDisplay.color}`}
                    >
                      <statusDisplay.icon className="w-3 h-3 mr-1" />
                      {statusDisplay.text}
                    </span>
                    <button
                      title="View Agreement Document"
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TenantRentals;
