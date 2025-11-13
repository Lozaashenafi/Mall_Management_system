import { useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addTenant } from "../services/tenantService";
import toast from "react-hot-toast";

export default function AddTenant() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    tinNumber: "",
    vatNumber: "",
    identificationDocument: null,
    businessLicense: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identificationDocument || !formData.businessLicense) {
      toast.error("Please upload both ID and Business License files.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await addTenant(data);
      toast.success("Tenant added successfully!");
      navigate("/manage-tenants");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add tenant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Tenant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the tenant details to create a new record.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+251-9xx-xxxxxx"
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">TIN Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="tinNumber"
                value={formData.tinNumber}
                onChange={handleChange}
                placeholder="123456789"
                className="flex-1 border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => {
                  if (!formData.tinNumber) {
                    toast.error("Please enter a TIN number first!");
                    return;
                  }
                  const tinUrl = `https://etrade.gov.et/business-license-checker?tin=${formData.tinNumber}`;
                  window.open(tinUrl, "_blank");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Check
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">VAT Number</label>
            <input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
              placeholder="ET1234567"
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* File Uploads */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Identification Document (Image)
            </label>
            <input
              type="file"
              name="identificationDocument"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business License (Image or PDF)
            </label>
            <input
              type="file"
              name="businessLicense"
              accept="image/*,.pdf"
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/manage-tenants")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
