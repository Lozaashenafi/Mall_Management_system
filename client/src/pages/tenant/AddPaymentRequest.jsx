import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createPaymentRequest,
  getInvoiceById,
  getUtilityInvoiceById,
} from "../../services/paymentRequestService";
import { useAuth } from "../../context/AuthContext";

export default function AddPaymentRequest() {
  const navigate = useNavigate();
  const { id, type } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    method: "Mobile",
    reference: "",
  });

  // Load invoice or utility invoice
  useEffect(() => {
    const fetchData = async () => {
      try {
        let data;
        if (type === "invoice") {
          data = await getInvoiceById(id);
          setFormData((prev) => ({
            ...prev,
            amount: data.totalAmount ? data.totalAmount.toString() : "0",
          }));
        } else if (type === "utility") {
          data = await getUtilityInvoiceById(id);
          setFormData((prev) => ({
            ...prev,
            amount: data.amount ? data.amount.toString() : "0",
          }));
        }
        setInvoice(data);
      } catch (error) {
        toast.error(error.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    if (id && type) fetchData();
  }, [id, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Create FormData for multipart/form-data
    const payload = new FormData();
    payload.append("userId", user.userId);
    if (type === "invoice") payload.append("invoiceId", id);
    if (type === "utility") payload.append("utilityInvoiceId", id);

    payload.append("amount", formData.amount);
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);
    if (proofFile) payload.append("proofFile", proofFile, proofFile.name);

    // Debug: log FormData content
    for (let pair of payload.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await createPaymentRequest(payload);
      toast.success("Payment request submitted successfully!");
      navigate("/tenant/payment-requests");
    } catch (err) {
      console.error("Error submitting payment request:", err);
      toast.error(err.message || "Failed to submit payment request");
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading invoice details...</div>;
  if (!invoice)
    return (
      <div className="text-center text-red-500 mt-10">Invoice not found!</div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">Request Payment Approval</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Invoice: {invoice?.rental?.tenant?.contactPerson || "Unknown"} -{" "}
        {invoice?.rental?.room?.unitNumber || "N/A"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Payment Date</label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Payment Method</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
            >
              <option value="Mobile">Mobile</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Reference (optional)</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Transaction ID or note"
              className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Upload Proof (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/tenant/payment-requests")}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
