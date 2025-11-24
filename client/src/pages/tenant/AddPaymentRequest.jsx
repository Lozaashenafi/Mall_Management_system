import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createPaymentRequest,
  getInvoiceById,
} from "../../services/paymentRequestService";

import { getBankAccounts } from "../../services/bankService";
import { useAuth } from "../../context/AuthContext";

export default function AddPaymentRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [proofFile, setProofFile] = useState(null);

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    method: "Mobile",
    reference: "",
    bankAccountId: "",
    name: "",
    account: "",
  });

  // Load invoice + bank accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        let data;
        data = await getInvoiceById(id);
        setFormData((prev) => ({
          ...prev,
          amount: data.totalAmount || "",
          reference: data.paperInvoiceNumber || "",
        }));
        setInvoice(data);
        console.log(data);
      } catch (error) {
        toast.error(error.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    const loadBankAccounts = async () => {
      try {
        const accountsData = await getBankAccounts();
        console.log(accountsData);
        setAccounts(accountsData);
      } catch {
        toast.error("Failed to load bank accounts");
      }
    };

    if (id) fetchData();
    loadBankAccounts();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("userId", user.userId);

    payload.append("invoiceId", id);

    payload.append("amount", formData.amount);
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);

    payload.append("bankAccountId", formData.bankAccountId);
    payload.append("name", formData.name);
    payload.append("account", formData.account);

    if (proofFile) payload.append("proofFile", proofFile);

    try {
      await createPaymentRequest(payload);
      toast.success("Payment request submitted successfully!");
      navigate("/tenant/payment-requests");
    } catch (err) {
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
        {/* Payment and amount */}
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

        {/* Method + Reference */}
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
            </select>
          </div>

          <div>
            <label className="block mb-1">Reference </label>
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
          <label className="block mb-1">Bank Account</label>
          <select
            name="bankAccountId"
            value={formData.bankAccountId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
          >
            <option value="">Select Bank Account</option>
            {accounts.map((acc) => (
              <option key={acc.bankAccountId} value={acc.bankAccountId}>
                {acc.bankName} ({acc.accountNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Your Account Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block mb-1">Your Account Number</label>
          <input
            type="text"
            name="account"
            value={formData.account}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className=" mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Upload Proof (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Buttons */}
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
