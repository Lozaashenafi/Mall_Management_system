import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getTenantById, updateTenant } from "../services/tenantService";
import toast from "react-hot-toast";

export default function EditTenant() {
  const navigate = useNavigate();
  const { id: tenantId } = useParams();

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    tinNumber: "",
    vatNumber: "",
    identificationDocument: null,
    businessLicense: null,
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState(null);

  // Fetch tenant data by ID
  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const data = await getTenantById(tenantId);
        setFormData({
          companyName: data.companyName || "",
          contactPerson: data.contactPerson || "",
          phone: data.phone || "",
          email: data.email || "",
          tinNumber: data.tinNumber || "",
          vatNumber: data.vatNumber || "",
          identificationDocument: data.identificationDocument || null,
          businessLicense: data.businessLicense || null,
          status: data.status || "Active",
        });
        setInitialData(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch tenant data");
      } finally {
        setFetching(false);
      }
    })();
  }, [tenantId]);

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
    try {
      setLoading(true);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          (key === "identificationDocument" || key === "businessLicense") &&
          value instanceof File
        ) {
          data.append(key, value);
        } else if (
          key !== "identificationDocument" &&
          key !== "businessLicense"
        ) {
          data.append(key, value);
        }
      });

      await updateTenant(tenantId, data);
      toast.success("Tenant updated successfully!");
      navigate("/manage-tenants");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update tenant.");
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Show loading spinner or message while fetching tenant data
  if (fetching) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading tenant data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Tenant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update the tenant details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
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

          {/* Contact Person */}
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

          {/* Phone */}
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

          {/* Email */}
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

          {/* TIN */}
          <div>
            <label className="block text-sm font-medium mb-1">TIN Number</label>
            <input
              type="text"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleChange}
              placeholder="123456789"
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* VAT */}
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

          {/* ID Document */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Identification Document (Image)
            </label>
            {initialData?.identificationDocument &&
              !(formData.identificationDocument instanceof File) && (
                <img
                  src={`http://localhost:3000${initialData.identificationDocument}`}
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

          {/* Business License */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Business License (Image or PDF)
            </label>
            {initialData?.businessLicense &&
              !(formData.businessLicense instanceof File) &&
              (initialData.businessLicense.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={`http://localhost:3000${initialData.businessLicense}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 underline mb-2 block"
                >
                  View PDF License
                </a>
              ) : (
                <img
                  src={`http://localhost:3000${initialData.businessLicense}`}
                  alt="Business License"
                  className="w-full h-48 object-cover border rounded-md mb-2"
                />
              ))}
            <input
              type="file"
              name="businessLicense"
              accept="image/*,.pdf"
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
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
