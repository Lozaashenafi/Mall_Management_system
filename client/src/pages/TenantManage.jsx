import { useEffect, useState } from "react";
import { getTenants, deleteTenant } from "../services/tenantService";
import { useNavigate } from "react-router-dom";

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
        alert(err.message);
      }
    }
  };

  const handleSaveEdit = () => {
    // Here you’d normally send update request
    // For demo, just close popup
    setSelectedTenant(null);
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
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-2 border dark:border-gray-700">No</th>
                <th className="p-2 border dark:border-gray-700">Company</th>
                <th className="p-2 border dark:border-gray-700">
                  Contact Person
                </th>
                <th className="p-2 border dark:border-gray-700">Phone</th>
                <th className="p-2 border dark:border-gray-700">Email</th>
                <th className="p-2 border dark:border-gray-700">Status</th>
                <th className="p-2 border dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => (
                <tr
                  key={tenant.tenantId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-2 border dark:border-gray-700">
                    {index + 1}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {tenant.companyName}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {tenant.contactPerson}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {tenant.phone}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {tenant.email}
                  </td>
                  <td className="p-2 border dark:border-gray-700">
                    {tenant.status}
                  </td>
                  <td className="p-2 border dark:border-gray-700 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                      onClick={() => handleDelete(tenant.tenantId)}
                    >
                      Delete
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Edit Tenant</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-3"
            >
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
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="flex justify-end space-x-2 mt-4">
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
