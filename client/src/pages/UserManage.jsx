import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Added X, ChevronLeft, ChevronRight
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
  const adminsPerPage = 8; // Increased for better data density

  // Derived state for pagination
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(admins.length / adminsPerPage);

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const users = await allUsers();
        // Filter and sort users to always show Super Admin first, if possible
        const sortedUsers = users.sort((a, b) => {
          if (a.role === "Super Admin" && b.role !== "Super Admin") return -1;
          if (a.role !== "Super Admin" && b.role === "Super Admin") return 1;
          return a.fullName.localeCompare(b.fullName);
        });
        setAdmins(sortedUsers);
      } catch (err) {
        toast.error(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Reset page to 1 if search/filter logic were introduced, or if an item is deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [admins.length, totalPages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await registerRequest(newAdmin);
      setAdmins((prev) => {
        const newAdmins = [res.user, ...prev];
        // Keep the list sorted after adding
        return newAdmins.sort((a, b) => {
          if (a.role === "Super Admin" && b.role !== "Super Admin") return -1;
          if (a.role !== "Super Admin" && b.role === "Super Admin") return 1;
          return a.fullName.localeCompare(b.fullName);
        });
      });
      setNewAdmin({
        fullName: "",
        email: "",
        role: "Admin",
        password: "",
        phone: "",
      });
      setShowAddForm(false);
      toast.success(`Admin ${res.user.fullName} created successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating admin");
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

  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-indigo-600 dark:text-indigo-400">
          Loading admin data...
        </p>
      </div>
    );

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 🚀 Header and Action Button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin User Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Control access and assign roles for administrative staff.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg shadow-md font-medium transition-colors 
            ${
              showAddForm
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
          {showAddForm ? (
            <X className="w-5 h-5" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          {showAddForm ? "Close Form" : "Add New Admin"}
        </button>
      </div>

      {/* 📝 Add New Admin Form */}
      <div className="relative">
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">
              Register New Admin
            </h2>
            <form
              onSubmit={handleAddAdmin}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newAdmin.fullName}
                onChange={handleInputChange}
                required
                className="col-span-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={newAdmin.email}
                onChange={handleInputChange}
                required
                className="col-span-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone (Optional)"
                value={newAdmin.phone}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="password"
                name="password"
                placeholder="Initial Password"
                value={newAdmin.password}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <select
                name="role"
                value={newAdmin.role}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
              <button
                type="submit"
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
              >
                Register Admin
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 📋 Admin List Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Administrators ({admins.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-300">
              <tr>
                <th className="p-4 font-medium tracking-wider">Name</th>
                <th className="p-4 font-medium tracking-wider">Email</th>
                <th className="p-4 font-medium tracking-wider">Phone</th>
                <th className="p-4 font-medium tracking-wider">Role</th>
                <th className="p-4 font-medium tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentAdmins.length > 0 ? (
                currentAdmins.map((admin) => (
                  <tr
                    key={admin.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {admin.fullName}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {admin.email}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {admin.phone || "N/A"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          admin.role === "Super Admin"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        {/* Edit functionality placeholder (assuming update logic exists elsewhere or will be added) */}
                        <button
                          title="Edit Admin"
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                          // Add actual edit handler here if needed
                          disabled // Disabling for now as no edit handler is implemented
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          title="Delete Admin"
                          onClick={() => handleDeleteAdmin(admin.userId)}
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Showing {indexOfFirstAdmin + 1} to
            {Math.min(indexOfLastAdmin, admins.length)} of {admins.length}
            entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
