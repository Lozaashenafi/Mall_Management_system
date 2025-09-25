import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RentManage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRental, setNewRental] = useState({
    tenantId: "",
    roomId: "",
    startDate: "",
    endDate: "",
    rentAmount: "",
    paymentDueDate: "",
    paymentInterval: "Monthly",
    status: "Active",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rentalsPerPage = 5;

  const indexOfLast = currentPage * rentalsPerPage;
  const indexOfFirst = indexOfLast - rentalsPerPage;
  const currentRentals = rentals.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rentals.length / rentalsPerPage);

  // Load junk data
  useEffect(() => {
    const fakeData = [
      {
        rentId: 1,
        tenant: { fullName: "John Doe" },
        room: { roomNumber: "A101" },
        rentAmount: 1200,
        paymentInterval: "Monthly",
        status: "Active",
      },
      {
        rentId: 2,
        tenant: { fullName: "Jane Smith" },
        room: { roomNumber: "B202" },
        rentAmount: 3500,
        paymentInterval: "Quarterly",
        status: "Pending",
      },
      {
        rentId: 3,
        tenant: { fullName: "David Brown" },
        room: { roomNumber: "C303" },
        rentAmount: 10000,
        paymentInterval: "Yearly",
        status: "Ended",
      },
      {
        rentId: 4,
        tenant: { fullName: "Alice Johnson" },
        room: { roomNumber: "D404" },
        rentAmount: 2500,
        paymentInterval: "Monthly",
        status: "Active",
      },
    ];
    setTimeout(() => {
      setRentals(fakeData);
      setLoading(false);
    }, 800); // fake delay
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRental((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRental = (e) => {
    e.preventDefault();
    const newEntry = {
      ...newRental,
      rentId: rentals.length + 1,
      tenant: { fullName: `Tenant #${newRental.tenantId}` },
      room: { roomNumber: `Room #${newRental.roomId}` },
    };
    setRentals((prev) => [newEntry, ...prev]);
    setNewRental({
      tenantId: "",
      roomId: "",
      startDate: "",
      endDate: "",
      rentAmount: "",
      paymentDueDate: "",
      paymentInterval: "Monthly",
      status: "Active",
    });
    setShowAddForm(false);
    toast.success("Rental created (mock)!");
  };

  const handleDeleteRental = (rentId) => {
    setRentals((prev) => prev.filter((r) => r.rentId !== rentId));
    toast.success("Rental deleted (mock)!");
  };

  if (loading)
    return (
      <p className="text-gray-700 dark:text-gray-300">Loading rentals...</p>
    );

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rent Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage tenant rentals, payments, and statuses
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? "Cancel" : "Add New Rental"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Register New Rental</h2>
          <form
            onSubmit={handleAddRental}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="number"
              name="tenantId"
              placeholder="Tenant ID"
              value={newRental.tenantId}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <input
              type="number"
              name="roomId"
              placeholder="Room ID"
              value={newRental.roomId}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <input
              type="date"
              name="startDate"
              value={newRental.startDate}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <input
              type="date"
              name="endDate"
              value={newRental.endDate}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <input
              type="number"
              name="rentAmount"
              placeholder="Rent Amount"
              value={newRental.rentAmount}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <input
              type="number"
              name="paymentDueDate"
              placeholder="Payment Due Day (e.g. 5)"
              value={newRental.paymentDueDate}
              onChange={handleInputChange}
              required
              className="p-2 border rounded-md dark:bg-gray-800"
            />
            <select
              name="paymentInterval"
              value={newRental.paymentInterval}
              onChange={handleInputChange}
              className="p-2 border rounded-md dark:bg-gray-800 col-span-1 md:col-span-2"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <select
              name="status"
              value={newRental.status}
              onChange={handleInputChange}
              className="p-2 border rounded-md dark:bg-gray-800 col-span-1 md:col-span-2"
            >
              <option value="Active">Active</option>
              <option value="Ended">Ended</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              type="submit"
              className="col-span-1 md:col-span-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
            >
              Register Rental
            </button>
          </form>
        </div>
      )}

      {/* Rental List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Rental List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3">Tenant</th>
                <th className="p-3">Room</th>
                <th className="p-3">Rent Amount</th>
                <th className="p-3">Interval</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRentals.map((rental) => (
                <tr
                  key={rental.rentId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3">
                    {rental.tenant?.fullName || rental.tenantId}
                  </td>
                  <td className="p-3">
                    {rental.room?.roomNumber || rental.roomId}
                  </td>
                  <td className="p-3">${rental.rentAmount}</td>
                  <td className="p-3">{rental.paymentInterval}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rental.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : rental.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      title="Delete Rental"
                      onClick={() => handleDeleteRental(rental.rentId)}
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

        {/* Pagination */}
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
    </div>
  );
}
