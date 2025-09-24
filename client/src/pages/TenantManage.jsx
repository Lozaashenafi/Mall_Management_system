import { useEffect, useState } from "react";
import {
  getTenants,
  deleteTenant,
  updateTenant,
} from "../services/tenantService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null); // for popup
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getTenants();
        setTenants(data.tenants);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      try {
        await deleteTenant(id);
        setTenants((prev) => prev.filter((t) => t.tenantId !== id));
      } catch (err) {
        toast.error(err.message);
      }
    }
  };
  const handleSaveEdit = async () => {
    try {
      const {
        tenantId,
        identificationDocument,
        companyName,
        contactPerson,
        phone,
        email,
        status,
      } = selectedTenant;

      const payload = { companyName, contactPerson, phone, email, status };

      // include file if replaced
      if (identificationDocument instanceof File) {
        payload.identificationDocument = identificationDocument;
      }

      // call backend
      const updatedTenant = await updateTenant(tenantId, payload);

      // ✅ Update local state immediately
      setTenants((prev) =>
        prev.map((t) => (t.tenantId === tenantId ? updatedTenant.tenant : t))
      );

      setSelectedTenant(null); // close popup
      toast.success("Tenant updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">
        Loading tenants...
      </p>
    );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tenant Management</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          onClick={() => navigate("/add-tenant")}
        >
          Add Tenant
        </button>
      </div>

      {tenants.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No tenants found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  No
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Company
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Contact Person
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr
                  key={tenant.tenantId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {tenant.companyName}
                  </td>
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {tenant.contactPerson}
                  </td>
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {tenant.phone}
                  </td>
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {tenant.email}
                  </td>
                  <td className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {tenant.status}
                  </td>
                  <td className="px-4 py-2 text-right flex justify-end gap-2">
                    <button
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleDelete(tenant.tenantId)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Edit Popup Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[700px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Edit Tenant</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Existing ID Image Preview */}
              {selectedTenant.identificationDocument && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current ID Document:
                  </p>
                  <img
                    src={`http://localhost:3000${selectedTenant.identificationDocument}`}
                    alt="Tenant ID"
                    className="w-64 h-44 object-cover border rounded-md mt-1"
                  />
                </div>
              )}

              {/* Replace with new file */}
              <div className="col-span-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedTenant({
                      ...selectedTenant,
                      identificationDocument: e.target.files[0],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <input
                type="text"
                value={selectedTenant.companyName}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    companyName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Company Name"
              />
              <input
                type="text"
                value={selectedTenant.contactPerson}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    contactPerson: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Contact Person"
              />
              <input
                type="text"
                value={selectedTenant.phone}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Phone"
              />
              <input
                type="email"
                value={selectedTenant.email}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Email"
              />

              <select
                value={selectedTenant.status}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    status: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 col-span-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Buttons - full row */}
              <div className="col-span-2 flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                  onClick={() => setSelectedTenant(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
