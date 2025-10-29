import { useState, useEffect } from "react";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createPayment } from "../services/paymentService";
import { getUtilityInvoiceById } from "../services/utilityService"; // new service

export default function AddUtilityPayment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: "",
    method: "Cash",
    reference: "",
  });

  // Fetch utility invoice by ID
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getUtilityInvoiceById(id);
        setInvoice(data);
        setFormData((prev) => ({
          ...prev,
          amountPaid: Math.round(data.totalAmount || data.amount || 0),
        }));
      } catch (error) {
        toast.error(error.message || "Failed to load utility invoice");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
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
    payload.append("amount", Number(formData.amountPaid));
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);
    if (receiptFile) payload.append("receipt", receiptFile);

    try {
      await createPayment(payload);
      toast.success("Utility payment added successfully!");
      navigate("/utilities");
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
        Loading utility invoice details...
      </div>
    );

  if (!invoice)
    return (
      <div className="text-center text-red-500 mt-10">
        Utility invoice not found!
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Utility Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tenant: {invoice.rental.tenant.contactPerson} — Room:{" "}
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Cash">Cash</option>
              <option value="Mobile">Mobile</option>
              <option value="Bank">Bank</option>
              <option value="Other">Other</option>
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
              placeholder="Transaction ID or note"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Upload Receipt (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Save className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </form>
    </div>
  );
}
