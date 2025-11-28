import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getPayments,
  getInvoices,
  deletePayment,
  deleteInvoice,
  updatePayment,
  updateInvoice,
  DownloadInvoice,
} from "../services/paymentService";
import UpdatePaymentStatus from "../components/UpdatePaymentStatus";
import {
  getPaymentRequests,
  updatePaymentRequestStatus,
  updateUtilityPaymentRequestStatus,
} from "../services/paymentRequestService";

import { getPayedUtilityInvoices } from "../services/utilityService.jsx";
import { BASE_URL } from "../config";

// Define the tabs for navigation
const tabs = [
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "requests", label: "Payment Requests" },
];

export default function Payments() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUtilityPage, setCurrentUtilityPage] = useState(1);
  const pageSize = 8;
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [utilityPayments, setUtilityPayments] = useState([]);

  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [paymentRequests, setPaymentRequests] = useState([]);

  // Helper function to render status badges
  const StatusBadge = ({ status }) => {
    let style = "";
    let Icon = null;
    switch (status) {
      case "Paid":
      case "Approved":
        style =
          "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
        Icon = CheckCircle;
        break;
      case "Rejected":
        style = "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200";
        Icon = XCircle;
        break;
      case "Unpaid":
      case "Pending":
      default:
        style =
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
        Icon = Clock;
        break;
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style}`}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      await deleteInvoice(invoiceId);
      setInvoices((prev) => prev.filter((i) => i.invoiceId !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete invoice");
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    const toastId = toast.loading("Downloading invoice...");

    try {
      const data = await DownloadInvoice(invoiceId);

      // create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice", { id: toastId });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoiceData, paymentData, requestData, utilityPaymentData] =
          await Promise.all([
            getInvoices(),
            getPayments(),
            getPaymentRequests(),
            getPayedUtilityInvoices(),
          ]);
        setInvoices(invoiceData || []);
        setPayments(paymentData || []);
        console.log(requestData);
        setPaymentRequests(requestData || []);
        setUtilityPayments(utilityPaymentData || []);
        console.log("Utility Payments:", utilityPaymentData);
      } catch (error) {
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // UPDATED: Handle status change for both rental and utility payment requests
  const handleStatusChange = async (
    paymentId,
    status,
    adminNote,
    isUtility = false
  ) => {
    try {
      let updated;

      if (isUtility) {
        // Use utility payment request service for utility payments
        updated = await updateUtilityPaymentRequestStatus(paymentId, {
          status,
          adminNote,
        });
      } else {
        // Use regular payment request service for rental payments
        updated = await updatePaymentRequestStatus(paymentId, {
          status,
          adminNote,
        });
      }

      console.log(updated);
      setPaymentRequests((prev) =>
        prev.map((r) => (r.requestId === updated.requestId ? updated : r))
      );
      toast.success(`Payment request ${status.toLowerCase()} successfully`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Pagination logic for rental payments
  const totalPages = Math.ceil(payments.length / pageSize);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Pagination logic for utility payments
  const totalUtilityPages = Math.ceil(utilityPayments.length / pageSize);
  const paginatedUtilityPayments = utilityPayments.slice(
    (currentUtilityPage - 1) * pageSize,
    currentUtilityPage * pageSize
  );

  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const goToPrevUtilityPage = () =>
    setCurrentUtilityPage((p) => Math.max(p - 1, 1));
  const goToNextUtilityPage = () =>
    setCurrentUtilityPage((p) => Math.min(p + 1, totalUtilityPages));

  // Reset page when switching to the payments tab
  useEffect(() => {
    if (activeTab === "payments") {
      setCurrentPage(1);
      setCurrentUtilityPage(1);
    }
  }, [activeTab]);

  const handleEdit = (type, data) => {
    if (type === "invoice" && data.status === "Paid") {
      toast.error("Paid invoices cannot be edited.");
      return;
    }
    setEditingItem({ type, data });
    setEditData({ ...data });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setEditData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      if (!editingItem) return;

      if (editingItem.type === "invoice") {
        const { paperInvoiceNumber } = editData;
        if (!paperInvoiceNumber)
          return toast.error("Invoice number is required");

        const dataToSend = { paperInvoiceNumber };

        const response = await updateInvoice(
          editingItem.data.invoiceId,
          dataToSend
        );

        if (response?.invoice) {
          setInvoices((prev) =>
            prev.map((i) =>
              i.invoiceId === response.invoice.invoiceId ? response.invoice : i
            )
          );
          toast.success("Invoice updated successfully");
          setEditingItem(null);
        } else {
          toast.error("Update failed");
        }
      } else {
        if (!editData.paymentId) return toast.error("Payment ID missing!");

        // Build FormData only if file is selected
        let dataToSend = { ...editData };
        if (editData.identificationDocument instanceof File) {
          const formData = new FormData();
          formData.append("amount", editData.amount);
          formData.append("paymentDate", editData.paymentDate);
          formData.append("method", editData.method);
          formData.append("reference", editData.reference);
          formData.append("receipt", editData.identificationDocument);

          dataToSend = formData;
        }

        const data = await updatePayment(editData.paymentId, dataToSend);
        if (data?.payment) {
          setPayments((prev) =>
            prev.map((p) =>
              p.paymentId === data.payment.paymentId ? data.payment : p
            )
          );
          toast.success("Payment updated");
        } else {
          toast.error("Update failed");
        }
      }

      setEditingItem(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // --- Render Functions for Tabs ---
  const renderInvoicesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tenant / Unit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Base Rent
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tax Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {invoices.length ? (
            invoices.map((inv) => (
              <tr
                key={inv.invoiceId}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {inv.rental?.tenant?.contactPerson || "Unknown"} /{" "}
                  {inv.rental?.room?.unitNumber || "N/A"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {inv.baseRent}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {inv.taxAmount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {inv.totalAmount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {inv.status === "Unpaid" && (
                      <>
                        <Link
                          to={`/payments/add/${inv.invoiceId}`}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Register Payment"
                        >
                          pay
                        </Link>
                        <button
                          onClick={() => handleDeleteInvoice(inv.invoiceId)}
                          className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit("invoice", inv)}
                      className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
                      title="Edit Invoice"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(inv.invoiceId)}
                      className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
              >
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPaymentsTable = () => (
    <div className="space-y-8">
      {/* Rental Payments Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
          Rental Payments
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payer / Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedPayments.length ? (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.paymentId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {p.invoice?.rental?.tenant?.contactPerson || "Unknown"} /{" "}
                      {p.invoice?.rental?.room?.unitNumber || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {p.amount} ETB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {p.method}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          setSelectedPayment({ ...p, type: "rental" })
                        }
                        className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No rental payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Rental Payments Pagination */}
        {payments.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Utility Payments Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
          Utility Payments
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payer / Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utility Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUtilityPayments.length ? (
                paginatedUtilityPayments.map((util) => (
                  <tr
                    key={util.id || util.utilityInvoiceId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {util.rental?.tenant?.contactPerson || "Unknown"} /{" "}
                      {util.rental?.room?.unitNumber || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {util.utilityCharge?.utilityType?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(
                        util.payment?.paymentDate || util.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {util.amount} ETB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {util.payment?.method || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={util.payment?.status || "Paid"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          setSelectedPayment({ ...util, type: "utility" })
                        }
                        className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No utility payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Utility Payments Pagination */}
        {utilityPayments.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={goToPrevUtilityPage}
              disabled={currentUtilityPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentUtilityPage} of {totalUtilityPages || 1}
            </span>
            <button
              onClick={goToNextUtilityPage}
              disabled={
                currentUtilityPage === totalUtilityPages ||
                totalUtilityPages === 0
              }
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // UPDATED: Payment Requests Table with proper utility handling
  const renderRequestsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tenant
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proof
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {paymentRequests.length > 0 ? (
            paymentRequests.map((req) => {
              const isUtility = !req.invoice; // Utility requests don't have invoice relation
              return (
                <tr
                  key={req.requestId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {isUtility ? "Utility" : "Rental"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {req.tenant?.contactPerson || "Unknown"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">
                    {req.amount} ETB
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {req.method}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {req.reference || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {req.proofFilePath ? (
                      <a
                        href={`${BASE_URL}${req.proofFilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View Proof
                      </a>
                    ) : (
                      <span className="text-gray-400">No proof</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {req.status === "Pending" ? (
                      <UpdatePaymentStatus
                        paymentId={req.requestId}
                        onStatusChange={(paymentId, status, adminNote) =>
                          handleStatusChange(
                            paymentId,
                            status,
                            adminNote,
                            isUtility
                          )
                        }
                        isUtility={isUtility}
                      />
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="8"
                className="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No payment requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Main Component Render ---
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          💰 Payment Management
        </h1>
        <Link
          to="/payments/invoice"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors font-medium"
        >
          <FileText className="w-5 h-5" /> Create Invoice
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-lg font-semibold -mb-px transition-colors duration-200
              ${
                activeTab === tab.id
                  ? "border-b-4 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4">
        {loading ? (
          <div className="text-center py-10 text-xl text-indigo-600 dark:text-indigo-400 font-medium">
            Loading payment data...
          </div>
        ) : (
          <>
            {activeTab === "invoices" && renderInvoicesTable()}
            {activeTab === "payments" && renderPaymentsTable()}
            {activeTab === "requests" && renderRequestsTable()}
          </>
        )}
      </div>

      {/* ===== POPUP MODAL for Edit ===== */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
                Edit {editingItem.type}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {editingItem.type === "invoice" ? (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paper Invoice Number
                  </label>
                  <input
                    type="text"
                    name="paperInvoiceNumber"
                    value={editData.paperInvoiceNumber || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    placeholder="Enter invoice number"
                    required
                  />
                </div>
              ) : null}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Payment Details
            </h2>

            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT SIDE DETAILS */}
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Tenant:</strong>{" "}
                  {selectedPayment.invoice
                    ? selectedPayment.invoice.rental?.tenant?.contactPerson
                    : selectedPayment.rental?.tenant?.contactPerson}
                </div>

                <div>
                  <strong>Unit:</strong>{" "}
                  {selectedPayment.invoice
                    ? selectedPayment.invoice.rental?.room?.unitNumber
                    : selectedPayment.rental?.room?.unitNumber}
                </div>

                <div>
                  <strong>Type:</strong>{" "}
                  {selectedPayment.invoice
                    ? "Rental Payment"
                    : "Utility Payment"}
                </div>

                <div>
                  <strong>Amount:</strong> {selectedPayment.amount} ETB
                </div>

                <div>
                  <strong>Method:</strong> {selectedPayment.method}
                </div>

                <div>
                  <strong>Reference:</strong>{" "}
                  {selectedPayment.reference || "N/A"}
                </div>

                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <strong>Status:</strong>{" "}
                  <StatusBadge status={selectedPayment.status} />
                </div>
              </div>

              {/* RIGHT SIDE RECEIPT */}
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">
                  Receipt
                </h3>

                {selectedPayment.receiptFilePath ? (
                  <a
                    href={`${BASE_URL}${selectedPayment.receipt}`}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-800 underline"
                  >
                    View Receipt
                  </a>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No file uploaded
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
