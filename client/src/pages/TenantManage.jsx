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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
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
                      onClick={() =>
                        navigate(`/edit-tenant/${tenant.tenantId}`)
                      }
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
    </div>
  );
};

export default TenantManage;
