import { useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addTenant } from "../services/tenantService"; // import your service
import toast from "react-hot-toast";

export default function AddTenant() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    identificationDocument: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === "identificationDocument") {
      setFormData((prev) => ({
        ...prev,
        identificationDocument: files[0],
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

    if (!formData.identificationDocument) {
      toast.error("Please upload an ID image.");
      return;
    }

    try {
      setLoading(true);
      // Use FormData for file upload
      const data = new FormData();
      data.append("companyName", formData.companyName);
      data.append("contactPerson", formData.contactPerson);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("identificationDocument", formData.identificationDocument);

      await addTenant(data); // call your backend API
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Tenant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the tenant details to create a new record
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
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
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Tenant ID Image
            </label>
            <input
              type="file"
              name="identificationDocument"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
