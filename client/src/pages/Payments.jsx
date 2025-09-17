import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Payments() {
  const [payments, setPayments] = useState([
    {
      paymentId: 1,
      invoiceId: 101,
      invoiceDate: "2025-09-01",
      baseRent: 4500,
      taxAmount: 500,
      totalAmount: 5000,
      paymentDate: "2025-09-05",
      amountPaid: 5000,
      method: "Bank Transfer",
      lateFee: 0,
      status: "Completed",
    },
    {
      paymentId: 2,
      invoiceId: 102,
      invoiceDate: "2025-09-03",
      baseRent: 2800,
      taxAmount: 200,
      totalAmount: 3000,
      paymentDate: "2025-09-04",
      amountPaid: 3000,
      method: "Cash",
      lateFee: 0,
      status: "Pending",
    },
    {
      paymentId: 3,
      invoiceId: 103,
      invoiceDate: "2025-09-05",
      baseRent: 4000,
      taxAmount: 500,
      totalAmount: 4500,
      paymentDate: "2025-09-06",
      amountPaid: 4500,
      method: "Credit Card",
      lateFee: 0,
      status: "Completed",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null); // For modal

  const pageSize = 5;
  const totalPages = Math.ceil(payments.length / pageSize);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setPayments((prev) => prev.filter((p) => p.paymentId !== paymentId));
    }
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="flex gap-2">
          <Link
            to="/payments/invoice"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            <FileText className="w-4 h-4" /> Create Invoice
          </Link>
          <Link
            to="/payments/add"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Plus className="w-4 h-4" /> Add Payment
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Invoice ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Payment Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Amount Paid
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Method
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedPayments.map((p) => (
              <tr
                key={p.paymentId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{p.invoiceId}</td>
                <td className="px-4 py-2">{p.paymentDate}</td>
                <td className="px-4 py-2">{p.amountPaid}</td>
                <td className="px-4 py-2">{p.method}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2 text-right flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                  <Link
                    to={`/manage-payments/edit/${p.paymentId}`}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.paymentId)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Popup */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Payment & Invoice Detail</h2>
            <div className="space-y-2 text-gray-900 dark:text-gray-100">
              <p>
                <strong>Invoice ID:</strong> {selectedPayment.invoiceId}
              </p>
              <p>
                <strong>Invoice Date:</strong> {selectedPayment.invoiceDate}
              </p>
              <p>
                <strong>Base Rent:</strong> {selectedPayment.baseRent || "-"}
              </p>
              <p>
                <strong>Tax Amount:</strong> {selectedPayment.taxAmount || "-"}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                {selectedPayment.totalAmount || "-"}
              </p>
              <hr className="my-2" />
              <p>
                <strong>Payment Date:</strong> {selectedPayment.paymentDate}
              </p>
              <p>
                <strong>Amount Paid:</strong> {selectedPayment.amountPaid}
              </p>
              <p>
                <strong>Late Fee:</strong> {selectedPayment.lateFee || "-"}
              </p>
              <p>
                <strong>Method:</strong> {selectedPayment.method}
              </p>
              <p>
                <strong>Status:</strong> {selectedPayment.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
