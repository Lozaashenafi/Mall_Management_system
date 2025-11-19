import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createPayment, getInvoiceById } from "../services/paymentService";
import { getBankAccounts } from "../services/bankService";

export default function AddPayment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: "",
    method: "Bank",
    reference: "",
    bankAccountId: "",
    account: "",
    name: "",
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
        setFormData((prev) => ({
          ...prev,
          amountPaid: Math.round(data.totalAmount || 0),
          name: data.rental.tenant.contactPerson, // default payer
        }));
      } catch (error) {
        toast.error(error.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
    if (id) fetchInvoice();
  }, [id]);
  const fetchAccounts = async () => {
    try {
      const res = await getBankAccounts();
      setAccounts(res);
    } catch (err) {
      toast.error("Failed to load bank accounts");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("invoiceId", Number(id));
    payload.append("amount", Number(formData.amountPaid));
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);

    // ➕ NEW REQUIRED FIELDS
    payload.append("bankAccountId", Number(formData.bankAccountId));
    payload.append("account", formData.account);
    payload.append("name", formData.name);

    if (receiptFile) payload.append("receipt", receiptFile);

    try {
      await createPayment(payload);
      toast.success("Payment added successfully!");
      navigate("/payments");
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
        Loading invoice details...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center text-red-500 mt-10">Invoice not found!</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Invoice: {invoice.rental.tenant.contactPerson} -{" "}
          {invoice.rental.room.unitNumber}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Method + Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Mobile">Mobile</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* REQUIRED BY BACKEND */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Account
            </label>

            <select
              name="bankAccountId"
              value={formData.bankAccountId}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="">Select Bank Account</option>

              {accounts.map((a) => (
                <option key={a.bankAccountId} value={a.bankAccountId}>
                  {a.bankName} ({a.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <input
              type="text"
              name="account"
              value={formData.account}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className=" text-sm font-medium mb-1 flex gap-2">
            <ImageIcon className="w-4 h-4" /> Upload Receipt (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            <X className="w-4 h-4" /> Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 flex gap-2 items-center"
          >
            <Save className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </form>
    </div>
  );
}
