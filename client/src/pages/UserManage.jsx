import { useState } from "react";
import { Plus, Edit, Trash2, Eye, UserPlus, User } from "lucide-react";

// Mock admins
const mockAdmins = [
  {
    adminId: 1,
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    role: "Super Admin",
  },
  {
    adminId: 2,
    firstName: "Bob",
    lastName: "Williams",
    email: "bob@example.com",
    role: "Admin",
  },
  {
    adminId: 3,
    firstName: "Charlie",
    lastName: "Davis",
    email: "charlie@example.com",
    role: "Admin",
  },
  {
    adminId: 4,
    firstName: "Dana",
    lastName: "Miller",
    email: "dana@example.com",
    role: "Super Admin",
  },
];

export default function UserManage() {
  const [admins, setAdmins] = useState(mockAdmins);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Admin",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  const totalPages = Math.ceil(admins.length / adminsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    const newId =
      admins.length > 0 ? Math.max(...admins.map((a) => a.adminId)) + 1 : 1;
    const adminToAdd = {
      ...newAdmin,
      adminId: newId,
    };
    setAdmins((prev) => [...prev, adminToAdd]);
    setNewAdmin({ firstName: "", lastName: "", email: "", role: "Admin" });
    setShowAddForm(false);
  };

  const handleDeleteAdmin = (adminId) => {
    setAdmins((prev) => prev.filter((admin) => admin.adminId !== adminId));
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage administrative users and their roles
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? "Cancel" : "Add New Admin"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-all duration-300 ease-in-out">
          <h2 className="text-lg font-semibold mb-4">Register New Admin</h2>
          <form
            onSubmit={handleAddAdmin}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={newAdmin.firstName}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={newAdmin.lastName}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={newAdmin.email}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 col-span-1 md:col-span-2"
            />
            <select
              name="role"
              value={newAdmin.role}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 col-span-1 md:col-span-2"
            >
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
            <button
              type="submit"
              className="col-span-1 md:col-span-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
            >
              Register Admin
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Admin List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAdmins.map((admin) => (
                <tr
                  key={admin.adminId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="p-3">{admin.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        admin.role === "Super Admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      title="Edit Admin"
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete Admin"
                      onClick={() => handleDeleteAdmin(admin.adminId)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
