import { useEffect, useState } from "react";
import {
  getTenants,
  deleteTenant,
  updateTenant,
} from "../services/tenantService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";

const TenantManage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
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

  const handleSaveEdit = async () => {
    try {
      const {
        tenantId,
        companyName,
        contactPerson,
        phone,
        email,
        status,
        tinNumber,
        vatNumber,
        identificationDocument,
        businessLicense,
      } = selectedTenant;

      const payload = {
        companyName,
        contactPerson,
        phone,
        email,
        status,
        tinNumber,
        vatNumber,
      };

      if (identificationDocument instanceof File)
        payload.identificationDocument = identificationDocument;
      if (businessLicense instanceof File)
        payload.businessLicense = businessLicense;

      const updatedTenant = await updateTenant(tenantId, payload);

      setTenants((prev) =>
        prev.map((t) => (t.tenantId === tenantId ? updatedTenant.tenant : t))
      );

      setSelectedTenant(null);
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
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
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
                <th className="px-4 py-2 text-left text-sm font-medium">No</th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Company
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Contact Person
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
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
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{tenant.companyName}</td>
                  <td className="px-4 py-2">{tenant.contactPerson}</td>
                  <td className="px-4 py-2">{tenant.phone}</td>
                  <td className="px-4 py-2">{tenant.email}</td>
                  <td className="px-4 py-2">{tenant.status}</td>
                  <td className="px-4 py-2 flex gap-2 justify-end">
                    <button
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[900px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Edit Tenant</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="grid grid-cols-2 gap-6"
            >
              {/* Side-by-side previews */}
              <div>
                {selectedTenant.identificationDocument && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Current ID Document:
                    </p>
                    <img
                      src={`http://localhost:3000${selectedTenant.identificationDocument}`}
                      alt="ID"
                      className="w-full h-48 object-cover border rounded-md"
                    />
                  </div>
                )}
                <label className="block mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Replace ID Document
                </label>
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
              <div>
                {selectedTenant.businessLicense && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Current Business License:
                    </p>

                    {/* ✅ Check if file is PDF or Image */}
                    {selectedTenant.businessLicense
                      .toLowerCase()
                      .endsWith(".pdf") ? (
                      <a
                        href={`http://localhost:3000${selectedTenant.businessLicense}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View PDF License
                      </a>
                    ) : (
                      <img
                        src={`http://localhost:3000${selectedTenant.businessLicense}`}
                        alt="Business License"
                        className="w-full h-48 object-cover border rounded-md"
                      />
                    )}
                  </div>
                )}

                <label className="block mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Replace Business License (Image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setSelectedTenant({
                      ...selectedTenant,
                      businessLicense: e.target.files[0],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              {/* Basic Info */}
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

              {/* Hidden TIN/VAT — kept editable but not in table */}
              <input
                type="text"
                value={selectedTenant.tinNumber || ""}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    tinNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="TIN Number"
              />
              <input
                type="text"
                value={selectedTenant.vatNumber || ""}
                onChange={(e) =>
                  setSelectedTenant({
                    ...selectedTenant,
                    vatNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="VAT Number"
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

              {/* Buttons */}
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

export default TenantManage;
