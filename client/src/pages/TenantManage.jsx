import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Link } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

// Mock tenants
const mockTenants = [
  {
    tenantId: 1,
    companyName: "ABC Trading PLC",
    contactPerson: "John Doe",
    phone: "+251-911-123456",
    email: "abc@example.com",
    status: "Active",
  },
  {
    tenantId: 2,
    companyName: "XYZ Import Export",
    contactPerson: "Jane Smith",
    phone: "+251-922-654321",
    email: "xyz@example.com",
    status: "Inactive",
  },
  {
    tenantId: 3,
    companyName: "Global Tech Solutions",
    contactPerson: "Mike Brown",
    phone: "+251-933-987654",
    email: "global@example.com",
    status: "Active",
  },
  // Add more mock tenants here to test pagination
];

export default function TenantManagement() {
  const [tenants, setTenants] = useState(mockTenants);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 5;

  // Calculate displayed tenants
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

  const totalPages = Math.ceil(tenants.length / tenantsPerPage);

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "Active").length,
    inactive: tenants.filter((t) => t.status === "Inactive").length,
  };

  const pieData = [
    { name: "Active", value: stats.active },
    { name: "Inactive", value: stats.inactive },
  ];

  const COLORS = ["#4CAF50", "#FF5252"];

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage tenants, agreements, and statuses
          </p>
        </div>
        <button
          onClick={() => navigate("/manage-tenants/add")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Tenants Table */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Tenant List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-3">Company</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTenants.map((tenant) => (
                <tr
                  key={tenant.tenantId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">{tenant.companyName}</td>
                  <td className="p-3">{tenant.contactPerson}</td>
                  <td className="p-3">{tenant.phone}</td>
                  <td className="p-3">{tenant.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        tenant.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Tenants</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Active</span>
              <span className="font-medium">{stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive</span>
              <span className="font-medium">{stats.inactive}</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Tenant Status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
