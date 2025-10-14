import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRentalById } from "../services/rentalService";
import {
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiHome,
  FiTool,
  FiFileText,
  FiX,
} from "react-icons/fi"; // Importing icons for visual appeal
import { X } from "lucide-react";

export default function RentDetail() {
  const { id } = useParams(); // rental ID from route
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const data = await getRentalById(id);
        setRental(data);
      } catch (error) {
        toast.error(error.message || "Failed to fetch rental details");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-600 animate-pulse">
          Loading rental details... ⏳
        </p>
      </div>
    );
  if (!rental)
    return (
      <div className="text-center p-10 bg-red-100 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-red-700">
          Rental not found 😔
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-900 rounded-lg ">
      <div className="border-b pb-4 border-gray-200  flex justify-between items-center mb-6 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <FiCalendar className="text-purple-600" />
          Rental Agreement for:{" "}
          <span className="text-purple-600">
            {rental.tenant?.contactPerson}
          </span>
        </h1>
        <Link
          to="/manage-rentals"
          className="p-3 rounded-full transition duration-300 bg-gray-100 hover:bg-red-500 dark:bg-gray-700 dark:hover:bg-red-600 group shadow-md"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-white" />
        </Link>
      </div>

      {/* Main Grid for Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Info Card */}
        <InfoCard title="Tenant Information" icon={FiUsers}>
          <DetailItem label="Company" value={rental.tenant?.companyName} />
          <DetailItem
            label="Contact Person"
            value={rental.tenant?.contactPerson}
          />
          <DetailItem label="Phone" value={rental.tenant?.phone} />
          <DetailItem label="Email" value={rental.tenant?.email} />
        </InfoCard>

        {/* Room Info Card */}
        <InfoCard title="Room Information" icon={FiHome}>
          <DetailItem label="Unit Number" value={rental.room?.unitNumber} />
          <DetailItem label="Floor" value={rental.room?.floor} />
          <DetailItem label="Size" value={`${rental.room?.size} m²`} />
          <DetailItem label="Type" value={rental.room?.roomType?.typeName} />
          {rental.room?.roomFeatures && rental.room.roomFeatures.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Features
              </h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                {rental.room.roomFeatures.map((f) => (
                  <li key={f.roomFeatureId}>
                    {f.featureType?.name} (
                    <span className="font-medium">x{f.count}</span>)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </InfoCard>

        {/* Rental Financials and Dates Card */}
        <InfoCard title="Rental Details & Terms" icon={FiDollarSign}>
          <DetailItem
            label="Status"
            value={<StatusPill status={rental.status} />}
          />
          <DetailItem
            label="Start Date"
            value={new Date(rental.startDate).toLocaleDateString()}
          />
          <DetailItem
            label="End Date"
            value={new Date(rental.endDate).toLocaleDateString()}
          />
          <DetailItem
            label="Rent Amount"
            value={`$${rental.rentAmount}`}
            highlight={true}
          />
          <DetailItem label="Payment Interval" value={rental.paymentInterval} />
          <DetailItem label="Payment Due Day" value={rental.paymentDueDate} />

          {/* Utilities Sub-section */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Utility & Service Inclusions
            </h3>
            <ul className="space-y-1 text-sm">
              <UtilityItem
                label="Shared Utilities"
                isIncluded={rental.sharedUtilities}
              />
              <UtilityItem
                label="Self-Managed Electricity"
                isIncluded={rental.selfManagedElectricity}
              />
              <UtilityItem
                label="Include Water"
                isIncluded={rental.includeWater}
              />
              <UtilityItem
                label="Include Electricity"
                isIncluded={rental.includeElectricity}
              />
              <UtilityItem
                label="Include Generator"
                isIncluded={rental.includeGenerator}
              />
              <UtilityItem
                label="Include Service"
                isIncluded={rental.includeService}
              />
              {rental.utilityShare && (
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Utility Share:</span>{" "}
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    ${rental.utilityShare}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </InfoCard>
      </div>

      {/* Tables/Lists Section (Full Width) */}
      <div className="space-y-8">
        {/* Invoices Table */}
        <SectionContainer title="Invoices & Payments" icon={FiFileText}>
          {rental.invoices && rental.invoices.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {[
                      "Invoice ID",
                      "Date",
                      "Due Date",
                      "Total Amount",
                      "Status",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {rental.invoices.map((inv) => (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {inv.invoiceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                        ${inv.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusPill status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No invoices have been generated for this rental yet.
            </p>
          )}
        </SectionContainer>

        {/* Maintenance Requests */}
        <SectionContainer title="Maintenance Requests" icon={FiTool}>
          {rental.maintenanceRequests &&
          rental.maintenanceRequests.length > 0 ? (
            <ul className="space-y-3">
              {rental.maintenanceRequests.map((m) => (
                <li
                  key={m.requestId}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                >
                  <span className="text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{m.description}</span> -
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({new Date(m.requestDate).toLocaleDateString()})
                    </span>
                  </span>
                  <StatusPill status={m.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No maintenance requests recorded.
            </p>
          )}
        </SectionContainer>
      </div>
    </div>
  );
}
const InfoCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full">
    <h2 className="text-xl font-bold  text-gray-900 dark:text-white flex items-center gap-2 border-b pb-3 mb-4">
      {Icon && <Icon className="text-purple-500 w-5 h-5" />}
      {title}
    </h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const SectionContainer = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 border-b pb-3">
      {Icon && <Icon className="text-purple-500 w-5 h-5" />}
      {title}
    </h2>
    {children}
  </div>
);

const DetailItem = ({ label, value, highlight = false }) => (
  <p className="flex justify-between items-center text-sm">
    <span className="text-gray-500 dark:text-gray-400 font-medium">
      {label}:
    </span>
    <span
      className={
        highlight
          ? "font-extrabold text-lg text-purple-600 dark:text-purple-400"
          : "font-semibold text-gray-800 dark:text-gray-200"
      }
    >
      {value || "N/A"}
    </span>
  </p>
);

const UtilityItem = ({ label, isIncluded }) => (
  <li className="flex justify-between items-center text-sm">
    <span className="text-gray-700 dark:text-gray-300">{label}:</span>
    <span
      className={`font-semibold ${
        isIncluded
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {isIncluded ? "Included" : "Not Included"}
    </span>
  </li>
);

/**
 * A colored pill component for displaying status.
 */
const StatusPill = ({ status }) => {
  let colorClass =
    "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  const statusLower = status?.toLowerCase();

  if (
    statusLower?.includes("active") ||
    statusLower?.includes("paid") ||
    statusLower?.includes("completed")
  ) {
    colorClass =
      "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
  } else if (
    statusLower?.includes("pending") ||
    statusLower?.includes("draft")
  ) {
    colorClass =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
  } else if (
    statusLower?.includes("overdue") ||
    statusLower?.includes("cancelled")
  ) {
    colorClass = "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
  } else if (statusLower?.includes("in-progress")) {
    colorClass =
      "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium uppercase ${colorClass}`}
    >
      {status}
    </span>
  );
};
