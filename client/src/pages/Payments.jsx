import { useState, useEffect } from "react";
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
import { toast } from "react-hot-toast";
import {
  getPayments,
  getInvoices,
  deletePayment,
} from "../services/paymentService";

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [invoiceData, paymentData] = await Promise.all([
          getInvoices(),
          getPayments(),
        ]);
        console.log(invoiceData, paymentData);
        setInvoices(invoiceData || []);
        setPayments(paymentData || []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(payments.length / pageSize);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Delete payment
  const handleDelete = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;

    try {
      await deletePayment(paymentId);
      setPayments((prev) => prev.filter((p) => p.paymentId !== paymentId));
      toast.success("Payment deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete payment");
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

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Invoice Table */}
          <div className="mb-6 overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
              Invoices
            </h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Invoice ID
                  </th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Base Rent</th>
                  <th className="px-4 py-2">Tax</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-2">{inv.invoiceId}</td>
                      <td className="px-4 py-2">
                        {new Date(inv.invoiceDate).toISOString().split("T")[0]}
                      </td>

                      <td className="px-4 py-2">{inv.baseRent}</td>
                      <td className="px-4 py-2">{inv.taxAmount}</td>
                      <td className="px-4 py-2">{inv.totalAmount}</td>
                      <td className="px-4 py-2">{inv.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
              Payments
            </h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">Invoice ID</th>
                  <th className="px-4 py-2">Payment Date</th>
                  <th className="px-4 py-2">Amount Paid</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((p) => (
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Modal */}
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
                <strong>Payment Date:</strong> {selectedPayment.paymentDate}
              </p>
              <p>
                <strong>Amount Paid:</strong> {selectedPayment.amountPaid}
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
