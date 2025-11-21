import React, { useState, useEffect, useMemo } from "react";
import { Save, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createUtilityPaymentRequest,
  getUtilityInvoiceById,
} from "../../services/paymentRequestService";
import { getBankAccounts } from "../../services/bankService";
import { useAuth } from "../../context/AuthContext";

export default function AddUtilityPaymentRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    method: "Mobile",
    reference: "",
    bankAccountId: "",
    name: "",
    account: "",
  });

  // Get utility invoice IDs from URL parameters using useMemo to prevent recreation
  const utilityInvoiceIds = useMemo(() => {
    const utilityIdsString = searchParams.get("ids");
    return utilityIdsString
      ? utilityIdsString
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : [];
  }, [searchParams]);

  // Load utility invoices and bank accounts
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched || loading === false) return;

    const fetchData = async () => {
      setLoading(true);
      console.log("Fetching data with invoice IDs:", utilityInvoiceIds);

      try {
        if (utilityInvoiceIds.length === 0) {
          toast.error("No utility invoices selected");
          setLoading(false);
          setHasFetched(true);
          return;
        }

        // Fetch utility invoices
        const fetchUtilityInvoices = async () => {
          try {
            const invoicePromises = utilityInvoiceIds.map((id) =>
              getUtilityInvoiceById(id)
                .then((response) => {
                  const invoiceData = response.data || response;
                  console.log(`Invoice ${id} data:`, invoiceData);
                  return invoiceData;
                })
                .catch((err) => {
                  console.error(`Failed to fetch invoice ${id}:`, err);
                  toast.error(`Failed to load invoice ${id}`);
                  return null;
                })
            );

            const invoicesData = await Promise.all(invoicePromises);
            const validInvoices = invoicesData.filter(
              (invoice) => invoice !== null && invoice !== undefined
            );

            if (validInvoices.length === 0) {
              toast.error("No valid utility invoices found");
              return [];
            }

            setInvoices(validInvoices);

            // Calculate total amount
            const total = validInvoices.reduce(
              (sum, invoice) => sum + (parseFloat(invoice.amount) || 0),
              0
            );
            setTotalAmount(total);
            setFormData((prev) => ({
              ...prev,
              amount: total.toString(),
            }));

            return validInvoices;
          } catch (error) {
            console.error("Error fetching utility invoices:", error);
            toast.error("Failed to load utility invoices");
            return [];
          }
        };

        // Fetch bank accounts
        const fetchBankAccounts = async () => {
          try {
            const accountsData = await getBankAccounts();
            setAccounts(accountsData || []);
          } catch (error) {
            console.error("Error loading bank accounts:", error);
            toast.error("Failed to load bank accounts");
            setAccounts([]);
          }
        };

        // Execute both fetches in parallel
        await Promise.all([fetchUtilityInvoices(), fetchBankAccounts()]);
      } catch (error) {
        console.error("Error in main fetch:", error);
      } finally {
        setLoading(false);
        setHasFetched(true);
        console.log("Data fetching completed");
      }
    };

    fetchData();
  }, [utilityInvoiceIds, hasFetched]); // Only depend on utilityInvoiceIds and hasFetched

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (utilityInvoiceIds.length === 0) {
      toast.error("No utility invoices selected for payment");
      return;
    }

    // Validate form data
    if (!formData.bankAccountId) {
      toast.error("Please select a bank account");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter your account name");
      return;
    }

    if (!formData.account.trim()) {
      toast.error("Please enter your account number");
      return;
    }

    if (!formData.reference.trim()) {
      toast.error("Please enter a reference number");
      return;
    }

    const payload = new FormData();
    payload.append("userId", user.userId);

    // Send as JSON string - this is more reliable
    payload.append("utilityInvoiceIds", JSON.stringify(utilityInvoiceIds));

    payload.append("amount", formData.amount);
    payload.append("method", formData.method);
    payload.append("reference", formData.reference);
    payload.append("paymentDate", formData.paymentDate);
    payload.append("bankAccountId", formData.bankAccountId);
    payload.append("name", formData.name.trim());
    payload.append("account", formData.account.trim());

    if (proofFile) {
      payload.append("receipt", proofFile);
    }

    // Debug: Log all FormData entries
    console.log("=== FormData Contents ===");
    console.log("utilityInvoiceIds array:", utilityInvoiceIds);
    console.log("utilityInvoiceIds JSON:", JSON.stringify(utilityInvoiceIds));
    for (let [key, value] of payload.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("=========================");

    try {
      console.log("Submitting utility payment request...");
      await createUtilityPaymentRequest(payload);
      toast.success(
        `Payment request submitted for ${utilityInvoiceIds.length} utility invoice(s)!`
      );
      navigate("/tenant/payment-requests");
    } catch (err) {
      console.error("Payment request submission error:", err);
      toast.error(err.message || "Failed to submit payment request");
    }
  };
  // Reset hasFetched when component unmounts or when IDs change significantly
  useEffect(() => {
    return () => {
      setHasFetched(false);
    };
  }, [utilityInvoiceIds.join(",")]); // Reset when the actual ID string changes

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="text-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4">Loading utility invoices...</p>
        </div>
      </div>
    );
  }

  if (utilityInvoiceIds.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="text-center text-red-500 mt-10">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No Utility Invoices Selected
          </h2>
          <p>Please go back and select utility invoices to pay.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (invoices.length === 0 && hasFetched) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="text-center text-red-500 mt-10">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No Valid Invoices Found
          </h2>
          <p>Could not load the selected utility invoices.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">
        Request Utility Payment Approval
      </h1>

      {/* Invoice Summary */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-semibold mb-2">Payment Summary</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Paying {invoices.length} utility invoice(s) for Unit{" "}
          {invoices[0]?.rental?.room?.unitNumber || "N/A"}
        </p>
        <div className="mt-2 text-sm">
          <p>
            <strong>Total Amount:</strong> ETB {totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Invoice List */}
        <div className="mt-3 max-h-40 overflow-y-auto">
          <h4 className="font-medium text-sm mb-2">Included Invoices:</h4>
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id || index}
              className="text-xs p-2 bg-white dark:bg-gray-800 rounded mb-1"
            >
              <div className="flex justify-between">
                <span>
                  {invoice.utilityCharge?.utilityType?.name || "Utility"} -{" "}
                  {invoice.utilityCharge?.month || "N/A"}
                </span>
                <span>ETB {invoice.amount?.toLocaleString() || "0"}</span>
              </div>
              <div className="text-gray-500">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    invoice.status?.toLowerCase() === "paid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {invoice.status || "UNKNOWN"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              className="w-full border p-2 rounded bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-1">Total Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border p-2 rounded bg-white dark:bg-gray-800"
              readOnly // Amount is calculated automatically
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
              className="w-full border p-2 rounded bg-white dark:bg-gray-800"
            >
              <option value="Mobile">Mobile Money</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Reference Number</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Transaction ID or reference number"
              required
              className="w-full border p-2 rounded bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Bank Account Details */}
        <div>
          <label className="block mb-1">Bank Account</label>
          <select
            name="bankAccountId"
            value={formData.bankAccountId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
          >
            <option value="">Select Bank Account</option>
            {accounts.map((acc) => (
              <option key={acc.bankAccountId} value={acc.bankAccountId}>
                {acc.bankName} - {acc.accountNumber} ({acc.accountName})
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
            placeholder="Name as it appears on your bank account"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
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
            placeholder="Your bank account number"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        {/* Proof Upload */}
        <div>
          <label className="mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Upload Payment Proof {proofFile && `(${proofFile.name})`}
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload screenshot, receipt, or transaction proof (optional but
            recommended)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Submit Payment Request
          </button>
        </div>
      </form>
    </div>
  );
}
