import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRentalById } from "../services/rentalService";
import { generateAgreement } from "../services/agreementService";

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

  const handleDownloadAgreement = async (agreement) => {
    try {
      const blob = await generateAgreement(rental.rentId); // or pass agreement id
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rental_Agreement_${rental.rentId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Agreement downloaded!");
    } catch (error) {
      toast.error("Failed to download agreement");
    }
  };

  if (loading) return <p>Loading rental details...</p>;
  if (!rental) return <p>Rental not found</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Rental Details: {rental.tenant?.contactPerson}
      </h1>

      {/* Tenant Info */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Tenant Information</h2>
        <p>
          <strong>Company:</strong> {rental.tenant?.companyName}
        </p>
        <p>
          <strong>Contact Person:</strong> {rental.tenant?.contactPerson}
        </p>
        <p>
          <strong>Phone:</strong> {rental.tenant?.phone}
        </p>
        <p>
          <strong>Email:</strong> {rental.tenant?.email}
        </p>
      </div>

      {/* Room Info */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Room Information</h2>
        <p>
          <strong>Unit Number:</strong> {rental.room?.unitNumber}
        </p>
        <p>
          <strong>Floor:</strong> {rental.room?.floor}
        </p>
        <p>
          <strong>Size:</strong> {rental.room?.size} m²
        </p>
        <p>
          <strong>Type:</strong> {rental.room?.roomType?.typeName}
        </p>
        <div>
          <strong>Features:</strong>
          <ul className="list-disc ml-5">
            {rental.room?.roomFeatures?.map((f) => (
              <li key={f.roomFeatureId}>
                {f.featureType?.name} (x{f.count})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rental Info */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Rental Details</h2>
        <p>
          <strong>Start Date:</strong>{" "}
          {new Date(rental.startDate).toLocaleDateString()}
        </p>
        <p>
          <strong>End Date:</strong>{" "}
          {new Date(rental.endDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {rental.status}
        </p>
        <p>
          <strong>Rent Amount:</strong> ${rental.rentAmount}
        </p>
        <p>
          <strong>Payment Interval:</strong> {rental.paymentInterval}
        </p>
        <p>
          <strong>Payment Due Day:</strong> {rental.paymentDueDate}
        </p>

        {/* Utilities */}
        <div className="mt-2">
          <h3 className="font-medium">Utilities</h3>
          <ul className="list-disc ml-5">
            <li>Shared Utilities: {rental.sharedUtilities ? "Yes" : "No"}</li>
            <li>
              Self-Managed Electricity:{" "}
              {rental.selfManagedElectricity ? "Yes" : "No"}
            </li>
            <li>Include Water: {rental.includeWater ? "Yes" : "No"}</li>
            <li>
              Include Electricity: {rental.includeElectricity ? "Yes" : "No"}
            </li>
            <li>Include Generator: {rental.includeGenerator ? "Yes" : "No"}</li>
            <li>Include Service: {rental.includeService ? "Yes" : "No"}</li>
            {rental.utilityShare && (
              <li>Utility Share: ${rental.utilityShare}</li>
            )}
          </ul>
        </div>
      </div>

      {/* Invoices */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Invoices</h2>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 border">Invoice ID</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Total Amount</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {rental.invoices?.map((inv) => (
              <tr key={inv.invoiceId} className="border-b">
                <td className="p-2 border">{inv.invoiceId}</td>
                <td className="p-2 border">
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">${inv.totalAmount}</td>
                <td className="p-2 border">{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Maintenance Requests */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Maintenance Requests</h2>
        <ul className="list-disc ml-5">
          {rental.maintenanceRequests?.map((m) => (
            <li key={m.requestId}>
              {m.description} - <strong>{m.status}</strong> (
              {new Date(m.requestDate).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>

      {/* Agreements */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="font-semibold text-lg">Agreements</h2>
        <ul className="list-disc ml-5">
          {rental.agreementDocuments?.map((doc) => (
            <li key={doc.documentId} className="flex items-center gap-2">
              <span>{doc.filePath}</span>
              <button
                onClick={() => handleDownloadAgreement(doc)}
                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-500"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
