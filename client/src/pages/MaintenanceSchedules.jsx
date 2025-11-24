import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiTool,
  FiPlusCircle,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEdit,
  FiTrash2,
  FiHome,
} from "react-icons/fi";
// --- Real API Imports from your service file ---
import {
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  updateMaintenanceScheduleStatus,
  deleteMaintenanceSchedule,
  getThisWeekMaintenanceSchedules,
} from "../services/maintenanceService"; // Assuming this path is correct

// --- Helper Functions ---

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "done":
      return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
    case "upcoming":
      return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
    case "pending": // Your backend implies a status, so let's use 'Pending' as a default if not 'Done' or 'Cancelled'
    default:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "done":
      return <FiCheckCircle className="w-4 h-4" />;
    case "upcoming":
      return <FiClock className="w-4 h-4" />;
    case "cancelled":
      return <FiXCircle className="w-4 h-4" />;
    default:
      return <FiLoader className="w-4 h-4" />;
  }
};

// --- Main Component ---

export default function MaintenanceSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null); // New state for editing
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    startDate: "", // Corresponds to backend's startDate
    duedate: "",
    recurrenceRule: "",
    category: "",
    frequency: "",
    priority: "",
    status: "Upcoming", // Default status for new schedules
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // --- Data Fetching ---

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await getMaintenanceSchedules();
      const weeklyResponse = await getThisWeekMaintenanceSchedules();
      setWeeklySchedules(weeklyResponse || []);
      console.log(response);
      setSchedules(response || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch maintenance schedules.");
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Management and Form Reset ---

  const openModalForCreate = () => {
    setEditingScheduleId(null);
    setScheduleForm({
      title: "",
      description: "",
      startDate: "",
      duedate: "",
      recurrenceRule: "",
      category: "",
      frequency: "",
      priority: "",
      status: "Upcoming",
    });
    setModalOpen(true);
  };

  const openModalForEdit = (schedule) => {
    setEditingScheduleId(schedule.scheduleId);
    // Format dates back to YYYY-MM-DD for the input fields
    const formattedStartDate = schedule.startDate
      ? new Date(schedule.startDate).toISOString().split("T")[0]
      : "";
    const formattedDuedate = schedule.duedate
      ? new Date(schedule.duedate).toISOString().split("T")[0]
      : "";

    setScheduleForm({
      title: schedule.title || "",
      description: schedule.description || "",
      startDate: formattedStartDate,
      duedate: formattedDuedate,
      recurrenceRule: schedule.recurrenceRule || "",
      category: schedule.category || "", // Assuming category is part of the returned data
      frequency: schedule.frequency || "", // Assuming frequency is part of the returned data
      priority: schedule.priority || "", // Assuming priority is part of the returned data
      status: schedule.status || "Upcoming",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingScheduleId(null);
  };

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.title || !scheduleForm.startDate) {
      return toast.error("Title and Start Date are required.");
    }

    setSubmitting(true);
    const toastId = toast.loading(
      editingScheduleId ? "Updating schedule..." : "Creating new schedule..."
    );

    try {
      const payload = {
        ...scheduleForm,
        // Backend expects ISO strings, but the form uses YYYY-MM-DD, which Date() handles.
        // The backend expects all fields (title, description, etc.) so we send the whole form.
      };

      if (editingScheduleId) {
        // UPDATE Logic
        await updateMaintenanceSchedule(editingScheduleId, payload);
        toast.success("Schedule updated successfully!", { id: toastId });
      } else {
        // CREATE Logic
        await createMaintenanceSchedule(payload);
        toast.success("Schedule created successfully!", { id: toastId });
      }

      closeModal();
      fetchSchedules(); // Re-fetch the list
    } catch (err) {
      const errorMessage =
        err.message ||
        err.error[0]?.message || // Assuming Zod errors might come back structured
        "Failed to save schedule.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (scheduleId, newStatus) => {
    const originalSchedules = [...schedules];

    // Get cost if status is 'Done'
    let cost = 0;
    if (newStatus === "Done") {
      const costInput = prompt(
        "Please enter the maintenance cost (optional, default 0):"
      );
      cost = costInput ? Number(costInput) : 0;
      if (isNaN(cost)) {
        return toast.error("Invalid cost value.");
      }
    }

    // Optimistic update
    setSchedules(
      schedules.map((s) =>
        s.scheduleId === scheduleId ? { ...s, status: newStatus } : s
      )
    );
    const toastId = toast.loading(`Updating status to ${newStatus}...`);

    try {
      // Corrected service call
      await updateMaintenanceScheduleStatus(scheduleId, newStatus, cost);
      toast.success(`Schedule updated to ${newStatus}.`, { id: toastId });
      fetchSchedules(); // Re-fetch to get the latest data including new maintenance record if status is Done
    } catch (err) {
      toast.error(`Failed to update status: ${err.message || "Server Error"}`, {
        id: toastId,
      });
      setSchedules(originalSchedules); // Rollback on failure
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    const originalSchedules = [...schedules];
    // Optimistic delete
    setSchedules(schedules.filter((s) => s.scheduleId !== scheduleId));

    const toastId = toast.loading("Deleting schedule...");

    try {
      await deleteMaintenanceSchedule(scheduleId);
      toast.success("Schedule deleted successfully.", { id: toastId });
    } catch (err) {
      toast.error(
        `Failed to delete schedule: ${err.message || "Server Error"}`,
        { id: toastId }
      );
      setSchedules(originalSchedules); // Rollback on failure
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetchSchedules();
  }, []);

  // --- Render Prep ---

  // Sort schedules: Upcoming first, then by date ascending
  const sortedSchedules = schedules.sort((a, b) => {
    // Note: The backend returns 'scheduleId', so we should use that key.
    // The keys from the database are 'startDate', 'duedate'.
    const statusOrder = { Upcoming: 1, Done: 3, Cancelled: 4, Pending: 2 };
    const aStatus = statusOrder[a.status] || 99;
    const bStatus = statusOrder[b.status] || 99;

    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }
    return new Date(a.startDate) - new Date(b.startDate);
  });

  // --- Render ---

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 🌟 Header and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-4 sm:mb-0">
          <FiTool className="text-indigo-600" />
          Maintenance Scheduling
        </h1>
        <button
          onClick={openModalForCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition duration-300 disabled:opacity-50 text-sm flex items-center gap-2"
        >
          <FiPlusCircle className="w-4 h-4" /> Schedule New Task
        </button>
      </div>

      {/* 📋 Schedules List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-indigo-500" /> Scheduled Tasks (
          {schedules.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <FiLoader className="animate-spin w-5 h-5" /> Loading schedules...
            </p>
          </div>
        ) : sortedSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedSchedules.map((schedule) => (
                  <tr
                    key={schedule.scheduleId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {schedule.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 max-w-xs truncate">
                        {schedule.description || "No description provided."}
                      </p>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                        Category: {schedule.category?.name || "N/A"} | Priority:{" "}
                        {schedule.priority || "Low"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(schedule.startDate).toLocaleDateString()}
                      {schedule.duedate && (
                        <span className="block text-xs text-gray-500">
                          Due: {new Date(schedule.duedate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 ${getStatusStyles(
                          schedule.status
                        )}`}
                      >
                        {getStatusIcon(schedule.status)} {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex justify-end items-center gap-2">
                      <select
                        value={schedule.status || "Upcoming"}
                        onChange={(e) =>
                          handleUpdateStatus(
                            schedule.scheduleId,
                            e.target.value
                          )
                        }
                        className="p-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white text-xs focus:ring-indigo-500 focus:border-indigo-500"
                        title="Change Status"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => openModalForEdit(schedule)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition duration-150"
                        title="Edit Task"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSchedule(schedule.scheduleId)
                        }
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition duration-150"
                        title="Delete Task"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-10 text-center">
            No maintenance schedules found. Click "Schedule New Task" to begin.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-indigo-500" /> This Week's Scheduled Tasks
          ({weeklySchedules.length})
        </h2>
        {weeklySchedules.length > 0 ? (
          <ul className="space-y-4">
            {weeklySchedules.map((schedule) => (
              <li
                key={schedule.scheduleId}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {schedule.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Start Date:{" "}
                  {new Date(schedule.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 ${getStatusStyles(
                      schedule.status
                    )}`}
                  >
                    {getStatusIcon(schedule.status)} {schedule.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-10 text-center">
            No scheduled tasks for this week.
          </p>
        )}
      </div>

      {/* --- Modal for Scheduling New/Edit Task --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-4/5 max-w-5xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiPlusCircle className="text-indigo-600 w-6 h-6" />{" "}
              {editingScheduleId
                ? "Edit Maintenance"
                : "Schedule New Maintenance"}
            </h3>
            <form
              onSubmit={handleCreateOrUpdateSchedule}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={scheduleForm.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={scheduleForm.startDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="duedate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  id="duedate"
                  name="duedate"
                  value={scheduleForm.duedate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={scheduleForm.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={scheduleForm.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Frequency
                </label>
                <select
                  name="frequency"
                  id="frequency"
                  value={scheduleForm.frequency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* Description (spans full width) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={scheduleForm.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>

              {/* Form Actions (span full width) */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin w-4 h-4" /> Saving...
                    </>
                  ) : editingScheduleId ? (
                    "Update Schedule"
                  ) : (
                    "Save Schedule"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
