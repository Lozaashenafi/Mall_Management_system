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
  const [selectedRental, setSelectedRental] = useState(null);

  const DEFAULT_TAX = 15; // %
  const DEFAULT_WITHHOLDING = 3; // %

  const [formData, setFormData] = useState({
    rentId: "",
    paperInvoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    baseRent: "",
    taxPercentage: DEFAULT_TAX,
    withholdingAmount: "",
    taxAmount: "",
    totalAmount: "",
    paymentInterval: "Monthly", // default
  });

  // Fetch rentalsa
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

  const calculateAmounts = (
    rental,
    taxPercentage = DEFAULT_TAX,
    interval = "Monthly"
  ) => {
    if (!rental)
      return {
        baseRent: 0,
        taxAmount: 0,
        withholdingAmount: 0,
        totalAmount: 0,
      };

    let rentAmount = Number(rental.rentAmount); // declare first

    // Adjust for payment interval
    if (interval === "Quarterly") rentAmount *= 3;
    else if (interval === "Yearly") rentAmount *= 12;

    const taxPct = Number(taxPercentage);

    const baseRent = rental.includeTax
      ? rentAmount / (1 + taxPct / 100)
      : rentAmount;

    const taxAmount = rental.includeTax
      ? rentAmount - baseRent
      : baseRent * (taxPct / 100);

    const withholdingAmount =
      baseRent >= 10000 ? baseRent * (DEFAULT_WITHHOLDING / 100) : 0;

    const totalAmount = rental.includeTax
      ? rentAmount - withholdingAmount
      : baseRent + taxAmount - withholdingAmount;

    return {
      baseRent: baseRent.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      withholdingAmount: withholdingAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rentId") {
      const rental = rentals.find((r) => r.rentId === parseInt(value));
      setSelectedRental(rental);

      if (rental) {
        const amounts = calculateAmounts(
          rental,
          DEFAULT_TAX,
          rental.paymentInterval || "Monthly"
        );

        setFormData((prev) => ({
          ...prev,
          rentId: value,
          paymentInterval: rental.paymentInterval || "Monthly",
          taxPercentage: DEFAULT_TAX,
          ...amounts,
        }));
      }
    } else if (name === "paymentInterval" || name === "taxPercentage") {
      if (selectedRental) {
        const amounts = calculateAmounts(
          selectedRental,
          parseFloat(name === "taxPercentage" ? value : formData.taxPercentage),
          name === "paymentInterval" ? value : formData.paymentInterval
        );

        setFormData((prev) => ({
          ...prev,
          [name]: value,
          ...amounts,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rentId) return toast.error("Please select a rental");
    if (!formData.paperInvoiceNumber)
      return toast.error("Please enter invoice number");

    try {
      await createInvoice({
        rentId: formData.rentId,
        paperInvoiceNumber: formData.paperInvoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        baseRent: parseFloat(formData.baseRent),
        taxPercentage: parseFloat(formData.taxPercentage),
        taxAmount: parseFloat(formData.taxAmount),
        withholdingAmount: parseFloat(formData.withholdingAmount),
        totalAmount: parseFloat(formData.totalAmount),
        paymentInterval: formData.paymentInterval,
      });

      toast.success("Invoice created successfully");
      navigate("/payments");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create invoice");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in invoice details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rental selection */}
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

        {/* Invoice Number */}
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

        {/* Dates */}
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

        {/* Interval + Tax */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Interval
            </label>
            <select
              name="paymentInterval"
              value={formData.paymentInterval}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
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

        {/* Calculated fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Rent</label>
            <input
              type="number"
              name="baseRent"
              value={formData.baseRent}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax Amount</label>
            <input
              type="number"
              value={formData.taxAmount}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Withholding
            </label>
            <input
              type="number"
              value={formData.withholdingAmount}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Amount
            </label>
            <input
              type="number"
              value={formData.totalAmount}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2"
            />
          </div>
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
            <Save className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
