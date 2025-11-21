import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createUtilityPayment } from "../services/paymentService";
import { getUtilityInvoiceById } from "../services/utilityService";
import { getBankAccounts } from "../services/bankService";

export default function AddUtilityPayment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    method: "bank",
    reference: "",
    bankAccountId: "",
    account: "",
    name: "",
  });

  // Load invoice + bank accounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUtilityInvoiceById(id);
        const banks = await getBankAccounts();

        setInvoice(data);
        setBankAccounts(banks);

        setFormData((prev) => ({
          ...prev,
          amount: Math.round(data.totalAmount || data.amount || 0),
          name: data?.rental?.tenant?.contactPerson || "",
        }));
      } catch (error) {
        toast.error(error.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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
    payload.append("utilityInvoiceId", Number(id));
    payload.append("amount", Number(formData.amount));
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);
    payload.append("bankAccountId", Number(formData.bankAccountId));
    payload.append("account", formData.account);
    payload.append("name", formData.name);

    if (receiptFile) payload.append("receipt", receiptFile);

    try {
      await createUtilityPayment(payload);
      toast.success("Utility payment added successfully!");
      navigate("/utilities");
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
        Loading...
      </div>
    );

  if (!invoice)
    return (
      <div className="text-center text-red-500 mt-10">
        Utility invoice not found!
      </div>
    );
  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Utility Payment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tenant:{" "}
          <span className="font-medium">
            {invoice.rental.tenant.contactPerson}
          </span>{" "}
          — Room{" "}
          <span className="font-medium">{invoice.rental.room.unitNumber}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Date + Amount */}
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
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
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
            <label className="block text-sm font-medium mb-1">
              Reference (optional)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Company Bank Account */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Account
          </label>
          <select
            name="bankAccountId"
            value={formData.bankAccountId}
            onChange={(e) => {
              const selected = bankAccounts.find(
                (b) => b.bankAccountId === Number(e.target.value)
              );
              setFormData((prev) => ({
                ...prev,
                bankAccountId: e.target.value,
              }));
            }}
            className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          >
            <option value="">Select account</option>
            {bankAccounts.map((acc) => (
              <option key={acc.bankAccountId} value={acc.bankAccountId}>
                {acc.bankName} — {acc.accountNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Payer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
              placeholder="Enter payer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payer Account Number
            </label>
            <input
              type="text"
              name="account"
              value={formData.account}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
              placeholder="Enter account number"
              required={formData.method === "Bank"}
            />
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="text-sm font-medium mb-1 flex items-center gap-2">
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
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </form>
    </div>
  );
}
