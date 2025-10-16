import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
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
  updatePayment,
  updateInvoice,
} from "../services/paymentService";

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoiceData, paymentData] = await Promise.all([
          getInvoices(),
          getPayments(),
        ]);
        setInvoices(invoiceData || []);
        setPayments(paymentData || []);
      } catch (error) {
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(payments.length / pageSize);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleEdit = (type, data) => {
    if (type === "invoice" && data.status === "Paid") {
      toast.error("Paid invoices cannot be edited.");
      return;
    }
    setEditingItem({ type, data });
    setEditData({ ...data });
    console.log("Editing item:", { type, data });
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
        const { paperInvoiceNumber, baseRent, taxPercentage } = editData;

        if (!paperInvoiceNumber)
          return toast.error("Invoice number is required");
        if (baseRent == null) return toast.error("Base Rent is required");
        if (taxPercentage == null)
          return toast.error("Tax Percentage is required");

        const taxAmount =
          (parseFloat(baseRent) * parseFloat(taxPercentage)) / 100;
        const totalAmount = parseFloat(baseRent) + taxAmount;

        const dataToSend = {
          paperInvoiceNumber,
          baseRent: parseFloat(baseRent),
          taxPercentage: parseFloat(taxPercentage),
          taxAmount,
          totalAmount,
        };

        const response = await updateInvoice(
          editingItem.data.invoiceId,
          dataToSend
        );
        console.log("Update response:", response);

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
        let dataToSend = editData;
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

  const handleDelete = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;
    try {
      await deletePayment(paymentId);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      toast.success("Payment deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete payment");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <Link
          to="/payments/invoice"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
        >
          <FileText className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* ===== INVOICE TABLE ===== */}
          <div className="mb-6 overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
              Invoices
            </h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Rental</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Base Rent</th>
                  <th className="px-4 py-2">Tax</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length ? (
                  invoices.map((inv) => (
                    <tr
                      key={inv.invoiceId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-2">
                        {inv.rental.tenant.contactPerson} -{" "}
                        {inv.rental.room.unitNumber}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(inv.invoiceDate).toISOString().split("T")[0]}
                      </td>
                      <td className="px-4 py-2">{inv.baseRent}</td>
                      <td className="px-4 py-2">{inv.taxAmount}</td>
                      <td className="px-4 py-2">{inv.totalAmount}</td>
                      <td className="px-4 py-2">{inv.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        {inv.status === "Unpaid" ? (
                          <Link
                            to={`/payments/add/${inv.invoiceId}`}
                            className="text-blue-600 hover:underline"
                          >
                            Pay
                          </Link>
                        ) : (
                          "N/A"
                        )}
                        <button
                          onClick={() => handleEdit("invoice", inv)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAYMENT TABLE ===== */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
              Payments
            </h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length ? (
                  paginatedPayments.map((p) => (
                    <tr
                      key={p.paymentId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-2">
                        {p.invoice.rental.tenant.contactPerson} -{" "}
                        {p.invoice.rental.room.unitNumber}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(p.paymentDate).toISOString().split("T")[0]}
                      </td>
                      <td className="px-4 py-2">{p.amount}</td>
                      <td className="px-4 py-2">{p.method}</td>
                      <td className="px-4 py-2">{p.status}</td>
                      <td className="px-4 py-2 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit("payment", p)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.paymentId)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATION ===== */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span>
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

      {/* ===== POPUP MODAL ===== */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold capitalize">
                Edit {editingItem.type}
              </h2>
              <button onClick={() => setEditingItem(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {editingItem.type === "invoice" ? (
              <>
                <label className="block mb-2 text-sm">Invoice Number</label>
                <input
                  type="text"
                  name="paperInvoiceNumber"
                  value={editData.paperInvoiceNumber || ""}
                  onChange={handleChange}
                  className="w-full mb-3 border px-2 py-1 rounded"
                />
                <label className="block mb-2 text-sm">Base Rent</label>
                <input
                  type="number"
                  name="baseRent"
                  value={editData.baseRent || ""}
                  onChange={handleChange}
                  className="w-full mb-3 border px-2 py-1 rounded"
                />
                <label className="block mb-2 text-sm">Tax %</label>
                <input
                  type="number"
                  name="taxPercentage"
                  value={editData.taxPercentage || ""}
                  onChange={handleChange}
                  className="w-full mb-3 border px-2 py-1 rounded"
                />
              </>
            ) : (
              <>
                <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={editData.amount || ""}
                      onChange={handleChange}
                      className="w-full mb-3 border px-2 py-1 rounded"
                    />

                    <label className="block mb-2 text-sm">Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={
                        editData.paymentDate
                          ? new Date(editData.paymentDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                      className="w-full mb-3 border px-2 py-1 rounded"
                    />

                    <label className="block mb-2 text-sm">Payment Method</label>
                    <select
                      name="method"
                      value={editData.method || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Bank">Bank</option>
                      <option value="TeleBirr">TeleBirr</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Reference</label>
                    <input
                      type="text"
                      name="reference"
                      value={editData.reference || ""}
                      onChange={handleChange}
                      className="w-full mb-3 border px-2 py-1 rounded"
                    />

                    <label className="block text-sm font-medium mb-1">
                      Identification Document (Image)
                    </label>
                    {editData?.receiptFilePath &&
                      !(editData.receiptFilePath instanceof File) && (
                        <img
                          src={`http://localhost:3000${editData.receiptFilePath}`}
                          alt="ID"
                          className="w-full h-48 object-cover border rounded-md mb-2"
                        />
                      )}
                    <input
                      type="file"
                      name="identificationDocument"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
