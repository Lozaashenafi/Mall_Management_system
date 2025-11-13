import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil, FileText, ListPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getRentals,
  createRental,
  updateRental,
  terminateRental,
} from "../services/rentalService";
import { getTenants } from "../services/tenantService";
import { getAvailableRooms } from "../services/roomService";
import { generateAgreement } from "../services/agreementService";
import { useNavigate } from "react-router-dom";

export default function RentManage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const [newRental, setNewRental] = useState({
    tenantId: "",
    roomId: "",
    startDate: "",
    endDate: "",
    rentAmount: "",
    paymentDueDate: "",
    paymentInterval: "Monthly",
    status: "Active",
    selfManagedElectricity: false,
    sharedUtilities: true,
    includeWater: true,
    includeElectricity: true,
    includeGenerator: true,
    includeService: true,
    includeTax: true,
  });

  // Edit state
  const [editingRental, setEditingRental] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rentalsPerPage = 5;

  const indexOfLast = currentPage * rentalsPerPage;
  const indexOfFirst = indexOfLast - rentalsPerPage;
  const currentRentals = rentals.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rentals.length / rentalsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalData, tenantData, roomData] = await Promise.all([
          getRentals(),
          getTenants(),
          getAvailableRooms(),
        ]);

        setRentals(rentalData.rentals || rentalData || []);
        setTenants(tenantData.tenants || tenantData || []);
        setRooms(roomData.rooms || roomData || []);
      } catch (error) {
        toast.error(error.message || "Failed to load rentals");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    const updateState = (prev) => {
      const updated = { ...prev, [name]: val };

      // ✅ When room is selected, set rentAmount to room price
      if (name === "roomId") {
        const selectedRoom = rooms.find((r) => r.roomId === Number(val));
        if (selectedRoom) {
          updated.rentAmount = selectedRoom.roomPrice || ""; // assumes room object has `price`
        }
      }

      if (name === "sharedUtilities") {
        if (!val) {
          updated.includeWater = false;
          updated.includeElectricity = false;
          updated.includeGenerator = false;
          updated.includeService = false;
          updated.utilityShare = "";
        } else {
          updated.includeWater = true;
          updated.includeElectricity = !prev.selfManagedElectricity;
          updated.includeGenerator = true;
          updated.includeService = true;
        }
      }

      if (name === "selfManagedElectricity") {
        if (val) updated.includeElectricity = false;
        else if (prev.sharedUtilities) updated.includeElectricity = true;
      }

      return updated;
    };

    if (editingRental) setEditingRental(updateState);
    else setNewRental(updateState);
  };

  const handleAddRental = async (e) => {
    e.preventDefault();
    try {
      // in create

      const rentalData = {
        tenantId: Number(newRental.tenantId),
        roomId: Number(newRental.roomId),
        rentAmount: parseFloat(newRental.rentAmount),
        startDate: newRental.startDate,
        endDate: newRental.endDate,
        paymentDueDate: Number(newRental.paymentDueDate),
        paymentInterval: newRental.paymentInterval,
        selfManagedElectricity: newRental.selfManagedElectricity,
        includeWater: newRental.includeWater,
        includeElectricity: newRental.includeElectricity,
        includeGenerator: newRental.includeGenerator,
        includeService: newRental.includeService,
        includeTax: newRental.includeTax,
        utilityShare: newRental.utilityShare || null,
      };

      delete rentalData.utilityShare;

      const created = await createRental(rentalData);

      // Find tenant and room objects from local state
      const tenantObj = tenants.find((t) => t.tenantId === created.tenantId);
      const roomObj = rooms.find((r) => r.roomId === created.roomId);

      // Merge tenant and room into the rental
      const rentalWithDetails = {
        ...created,
        tenant: tenantObj,
        room: roomObj,
      };

      setRentals((prev) => [rentalWithDetails, ...prev]);
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
      toast.success("Rental created!");
    } catch (error) {
      toast.error(error.message || "Failed to create rental");
    }
  };
  const handleGenerateAgreement = async (rental) => {
    try {
      const blob = await generateAgreement(rental.rentId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rental_Agreement_${rental.rentId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Agreement downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate agreement");
    }
  };

  const handleUpdateRental = async (e) => {
    e.preventDefault();
    try {
      await updateRental(editingRental.rentId, {
        startDate: editingRental.startDate,
        endDate: editingRental.endDate,
        rentAmount: parseFloat(editingRental.rentAmount),
        paymentDueDate: Number(editingRental.paymentDueDate),
        paymentInterval: editingRental.paymentInterval,
        selfManagedElectricity: editingRental.selfManagedElectricity,
        includeWater: editingRental.includeWater,
        includeElectricity: editingRental.includeElectricity,
        includeGenerator: editingRental.includeGenerator,
        includeService: editingRental.includeService,
        includeTax: editingRental.includeTax,
        utilityShare: editingRental.utilityShare || null,
      });
      // Merge changes locally
      setRentals((prev) =>
        prev.map((r) =>
          r.rentId === editingRental.rentId
            ? { ...r, ...editingRental } // Use the edited state directly
            : r
        )
      );

      setEditingRental(null);
      toast.success("Rental updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update rental");
    }
  };
  const getAllowedIntervals = (startDate, endDate, useToday = false) => {
    if (!endDate) return ["Monthly", "Quarterly", "Yearly"];

    const today = new Date();
    const start = useToday ? today : new Date(startDate);
    const end = new Date(endDate);

    // Calculate month difference
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1;

    const allowed = [];
    if (months >= 1) allowed.push("Monthly");
    if (months >= 3) allowed.push("Quarterly");
    if (months >= 12) allowed.push("Yearly");

    return allowed;
  };
  const handleTerminateRental = async (rentalId) => {
    const confirm = window.confirm(
      "Are you sure you want to terminate this rental?"
    );
    if (!confirm) return;

    try {
      const res = await terminateRental(rentalId);

      // Update the rentals state immediately
      setRentals((prev) =>
        prev.map((r) =>
          r.rentId === rentalId
            ? { ...r, status: "Terminated", endDate: new Date().toISOString() }
            : r
        )
      );

      toast.success(res.message || "Rental terminated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to terminate rental");
    }
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
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
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
            {/* Tenant */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tenant
              </label>
              <select
                name="tenantId"
                value={newRental.tenantId}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.contactPerson} - {tenant.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room
              </label>
              <select
                name="roomId"
                value={newRental.roomId}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.unitNumber} (Floor {room.floor})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={newRental.startDate}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={newRental.endDate}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              />
            </div>

            {/* Rent Amount */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rent Amount
              </label>
              <input
                type="number"
                name="rentAmount"
                placeholder="Enter Rent Amount"
                value={newRental.rentAmount}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              />
            </div>

            {/* Payment Due Day */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Due Day (e.g. 5)
              </label>
              <input
                type="number"
                name="paymentDueDate"
                placeholder="Payment Due Day"
                value={newRental.paymentDueDate}
                onChange={handleInputChange}
                required
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              />
            </div>

            {/* Payment Interval */}
            <div className="flex flex-col md:col-span-2">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Interval
              </label>
              <select
                name="paymentInterval"
                value={newRental.paymentInterval}
                onChange={handleInputChange}
                className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              >
                {getAllowedIntervals(
                  newRental.startDate,
                  newRental.endDate
                ).map((interval) => (
                  <option key={interval} value={interval}>
                    {interval}
                  </option>
                ))}
              </select>
            </div>

            {/* Shared Utilities Section */}
            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-4">
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="sharedUtilities"
                  checked={newRental.sharedUtilities}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Shared Utilities
              </label>

              {newRental.sharedUtilities && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pl-4 border-l border-gray-300 dark:border-gray-600">
                  {/* Self Managed Electricity */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="selfManagedElectricity"
                      checked={newRental.selfManagedElectricity}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    Self-Managed Electricity
                  </label>

                  {/* Utility Share */}
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Utility Share (optional)
                    </label>
                    <input
                      type="number"
                      name="utilityShare"
                      placeholder="Enter Utility Share"
                      value={newRental.utilityShare}
                      onChange={handleInputChange}
                      className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                    />
                  </div>

                  {/* Include Water */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeWater"
                      checked={newRental.includeWater}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    Include Water
                  </label>

                  {/* Include Electricity */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeElectricity"
                      checked={newRental.includeElectricity}
                      onChange={handleInputChange}
                      disabled={newRental.selfManagedElectricity}
                      className="w-4 h-4"
                    />
                    Include Electricity
                  </label>

                  {/* Include Generator */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeGenerator"
                      checked={newRental.includeGenerator}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    Include Generator
                  </label>

                  {/* Include Service */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeService"
                      checked={newRental.includeService}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    Include Service
                  </label>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="includeTax"
                checked={newRental.includeTax}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              Include Tax
            </label>

            <button
              type="submit"
              className="col-span-1 md:col-span-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Register Rental
            </button>
          </form>
        </div>
      )}
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
                <th className="p-3">Payment Due</th>
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
                    {rental.tenant?.contactPerson || rental.tenantId}
                  </td>
                  <td className="p-3">
                    {rental.room?.unitNumber || rental.roomId}
                  </td>
                  <td className="p-3">${rental.rentAmount}</td>
                  <td className="p-3">{rental.paymentInterval}</td>
                  <td className="p-3">{rental.paymentDueDate}</td>
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
                  <td className="p-3 flex gap-2">
                    {/* Edit */}
                    <button
                      title="Edit Rental"
                      onClick={() => setEditingRental(rental)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete / Terminate */}
                    <button
                      title="Terminate Rental"
                      onClick={() => handleTerminateRental(rental.rentId)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Generate Agreement */}
                    <button
                      title="Generate Agreement"
                      onClick={() => handleGenerateAgreement(rental)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      title="Generate Agreement"
                      onClick={() => navigate(`/rent-detail/${rental.rentId}`)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600"
                    >
                      <ListPlus className="w-4 h-4" />
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

      {/* Edit Modal */}
      {editingRental && (
        <div className="fixed inset-0  bg-black/50 dark:bg-black/60 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lvh">
            <h2 className="text-lg font-semibold mb-4">Edit Rental</h2>
            <form
              onSubmit={handleUpdateRental}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Start Date */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={editingRental.startDate?.split("T")[0] || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={editingRental.endDate?.split("T")[0] || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                />
              </div>

              {/* Rent Amount */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rent Amount
                </label>
                <input
                  type="number"
                  name="rentAmount"
                  value={editingRental.rentAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                />
              </div>

              {/* Payment Due Date */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Due Date (Day of Month)
                </label>
                <input
                  type="number"
                  name="paymentDueDate"
                  value={editingRental.paymentDueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                />
              </div>

              {/* Payment Interval */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Interval
                </label>
                <select
                  name="paymentInterval"
                  value={editingRental.paymentInterval}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                >
                  {getAllowedIntervals(
                    editingRental.startDate,
                    editingRental.endDate,
                    true
                  ).map((interval) => (
                    <option key={interval} value={interval}>
                      {interval}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shared Utilities Section (full width) */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="sharedUtilities"
                    checked={editingRental.sharedUtilities}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  Shared Utilities
                </label>

                {editingRental.sharedUtilities && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pl-4 border-l border-gray-300 dark:border-gray-600">
                    {/* Self Managed Electricity */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="selfManagedElectricity"
                        checked={editingRental.selfManagedElectricity}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      Self-Managed Electricity
                    </label>

                    {/* Utility Share */}
                    <input
                      type="number"
                      name="utilityShare"
                      placeholder="Utility Share (optional)"
                      value={editingRental.utilityShare || ""}
                      onChange={handleInputChange}
                      className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                    />

                    {/* Include Water */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="includeWater"
                        checked={editingRental.includeWater}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      Include Water
                    </label>

                    {/* Include Electricity */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="includeElectricity"
                        checked={editingRental.includeElectricity}
                        onChange={handleInputChange}
                        disabled={editingRental.selfManagedElectricity}
                        className="w-4 h-4"
                      />
                      Include Electricity
                    </label>

                    {/* Include Generator */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="includeGenerator"
                        checked={editingRental.includeGenerator}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      Include Generator
                    </label>

                    {/* Include Service */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="includeService"
                        checked={editingRental.includeService}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      Include Service
                    </label>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="includeTax"
                  checked={editingRental.includeTax}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Include Tax
              </label>

              {/* Actions (full width) */}
              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingRental(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
