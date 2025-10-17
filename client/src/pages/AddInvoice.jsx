import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../services/paymentService";
import { getRentals } from "../services/rentalService";
import { toast } from "react-hot-toast";

export default function AddInvoice() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    rentId: "",
    paperInvoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    baseRent: "",
    taxPercentage: "",
  });

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await getRentals();
        setRentals(res.rentals || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch rentals");
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rentId") {
      // find the selected rental
      const selectedRental = rentals.find((r) => r.rentId === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        rentId: value,
        baseRent: selectedRental ? selectedRental.rentAmount : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rentId) return toast.error("Please select a rental");
    if (!formData.paperInvoiceNumber)
      return toast.error("Please enter invoice number");

    const taxAmount = (formData.baseRent * formData.taxPercentage) / 100;
    const totalAmount = parseFloat(formData.baseRent) + taxAmount;

    try {
      await createInvoice({
        rentId: formData.rentId,
        paperInvoiceNumber: formData.paperInvoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        baseRent: parseFloat(formData.baseRent),
        taxPercentage: parseFloat(formData.taxPercentage),
        taxAmount,
        totalAmount,
      });

      toast.success("Invoice created successfully");
      navigate("/payments");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create invoice");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900    p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in invoice details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Rental
          </label>
          {loading ? (
            <p>Loading rentals...</p>
          ) : (
            <select
              name="rentId"
              value={formData.rentId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="">-- Select Tenant & Room --</option>
              {rentals.map((r) => (
                <option key={r.rentId} value={r.rentId}>
                  {r.tenant.contactPerson} - {r.room.unitNumber}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            name="paperInvoiceNumber"
            value={formData.paperInvoiceNumber}
            onChange={handleChange}
            required
            placeholder="INV-2025-001"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Rent</label>
            <input
              type="number"
              name="baseRent"
              value={formData.baseRent}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              readOnly
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tax Percentage (%)
            </label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

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
            <Save className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
