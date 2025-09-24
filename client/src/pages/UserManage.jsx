import { useState, useEffect } from "react";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { registerRequest, allUsers, deleteUser } from "../services/authService";
import { toast } from "react-hot-toast";
// your imported API functions

export default function UserManage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    role: "Admin",
    password: "",
    phone: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(admins.length / adminsPerPage);

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const users = await allUsers();
        setAdmins(users);
      } catch (err) {
        console.error(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await registerRequest(newAdmin);
      setAdmins((prev) => [res.user, ...prev]);
      setNewAdmin({
        fullName: "",
        email: "",
        role: "Admin",
        password: "",
        phone: "",
      });
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.message || "Error creating admin");
    }
  };
  const handleDeleteAdmin = async (userId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this admin? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      await deleteUser(userId);
      setAdmins((prev) => prev.filter((u) => u.userId !== userId));
      toast.success("Admin deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete admin");
    }
  };
  if (loading)
    return (
      <p className="text-gray-700 dark:text-gray-300">Loading admins...</p>
    );

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
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

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-all duration-300 ease-in-out">
          <h2 className="text-lg font-semibold mb-4">Register New Admin</h2>
          <form
            onSubmit={handleAddAdmin}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={newAdmin.fullName}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={newAdmin.email}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={newAdmin.phone}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            />
            <select
              name="role"
              value={newAdmin.role}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 col-span-1 md:col-span-2"
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

      {/* Admin List */}
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
                  key={admin.userId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">{admin.fullName}</td>
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
                      title="Delete Admin"
                      onClick={() => handleDeleteAdmin(admin.userId)}
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
