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
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  getThisWeekMaintenanceSchedules,
  updateMaintenanceScheduleOccurrenceStatus,
  deleteMaintenanceScheduleOccurrence,
} from "../services/maintenanceService";

// --- Helper Functions ---
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "done":
      return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
    case "upcoming":
      return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
    case "pending":
    case "postponed":
      return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
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
    case "postponed":
      return <FiClock className="w-4 h-4" />;
    default:
      return <FiLoader className="w-4 h-4" />;
  }
};

// --- Occurrences Dropdown Component ---
const OccurrencesDropdown = ({
  occurrences,
  scheduleId,
  onOccurrenceUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    occurrenceId: null,
    action: null,
    note: "",
    cost: "",
  });

  const canShowOccurrenceActions = (status) => {
    const lower = status?.toLowerCase();
    return lower === "upcoming" || lower === "pending";
  };

  const isOccurrenceInProgress = (status) =>
    status?.toLowerCase() === "pending";

  const openOccurrenceStatusModal = (occurrenceId, action) => {
    setStatusModal({ open: true, occurrenceId, action, note: "", cost: "" });
  };

  const submitOccurrenceStatusChange = async () => {
    try {
      const payload = {
        status: statusModal.action,
        adminNote: statusModal.note,
      };

      if (statusModal.action === "done") {
        payload.cost = Number(statusModal.cost) || 0;
      }

      await updateMaintenanceScheduleOccurrenceStatus(
        statusModal.occurrenceId,
        payload
      );
      toast.success("Occurrence status updated");

      setStatusModal({
        open: false,
        occurrenceId: null,
        action: null,
        note: "",
        cost: "",
      });

      if (onOccurrenceUpdate) {
        onOccurrenceUpdate();
      }
    } catch (err) {
      toast.error("Failed to update occurrence status");
    }
  };

  const handleDeleteOccurrence = async (occurrenceId, status) => {
    if (status?.toLowerCase() !== "upcoming") {
      toast.error("Only upcoming occurrences can be deleted");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this occurrence?")) {
      return;
    }

    try {
      await deleteMaintenanceScheduleOccurrence(occurrenceId);
      toast.success("Occurrence deleted successfully");

      if (onOccurrenceUpdate) {
        onOccurrenceUpdate();
      }
    } catch (err) {
      toast.error(
        `Failed to delete occurrence: ${err.message || "Server Error"}`
      );
    }
  };

  const handleOccurrenceStatusChange = async (occurrenceId, newStatus) => {
    if (newStatus.toLowerCase() === "pending") {
      try {
        await updateMaintenanceScheduleOccurrenceStatus(occurrenceId, {
          status: newStatus,
        });
        toast.success(`Occurrence updated to ${newStatus}`);

        if (onOccurrenceUpdate) {
          onOccurrenceUpdate();
        }
      } catch (err) {
        toast.error(
          `Failed to update status: ${err.message || "Server Error"}`
        );
      }
    } else {
      openOccurrenceStatusModal(occurrenceId, newStatus.toLowerCase());
    }
  };

  if (!occurrences || occurrences.length === 0) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        No occurrences
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        {occurrences.length} occurrence{occurrences.length !== 1 ? "s" : ""}
        {isOpen ? (
          <FiChevronUp className="w-3 h-3" />
        ) : (
          <FiChevronDown className="w-3 h-3" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Occurrences:
          </h4>
          <div className="space-y-3">
            {occurrences.map((occurrence) => (
              <div
                key={occurrence.occurrenceId}
                className="text-xs p-3 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
              >
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Date:
                      </span>
                      <span className="ml-1 text-gray-700 dark:text-gray-200">
                        {new Date(
                          occurrence.occurrenceDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Status:
                      </span>
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusStyles(
                          occurrence.status
                        )}`}
                      >
                        {occurrence.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Start:
                      </span>
                      <span className="ml-1 text-gray-700 dark:text-gray-200">
                        {occurrence.startDateTime
                          ? new Date(
                              occurrence.startDateTime
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Due:
                      </span>
                      <span className="ml-1 text-gray-700 dark:text-gray-200">
                        {occurrence.dueDate
                          ? new Date(occurrence.dueDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {occurrence.notified && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Notified:
                        </span>
                        <span className="ml-1 text-green-600 dark:text-green-400">
                          Yes{" "}
                          {occurrence.notifiedAt &&
                            `(${new Date(
                              occurrence.notifiedAt
                            ).toLocaleDateString()})`}
                        </span>
                      </div>
                    )}
                  </div>

                  {canShowOccurrenceActions(occurrence.status) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-500">
                      <select
                        value={occurrence.status || "Upcoming"}
                        onChange={(e) =>
                          handleOccurrenceStatusChange(
                            occurrence.occurrenceId,
                            e.target.value
                          )
                        }
                        className="p-1 border border-gray-300 rounded text-xs focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        title="Change Occurrence Status"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Pending">Pending</option>
                      </select>

                      <div className="flex gap-1">
                        {!isOccurrenceInProgress(occurrence.status) && (
                          <button
                            onClick={() =>
                              handleDeleteOccurrence(
                                occurrence.occurrenceId,
                                occurrence.status
                              )
                            }
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Occurrence"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        )}

                        {isOccurrenceInProgress(occurrence.status) && (
                          <>
                            <button
                              onClick={() =>
                                openOccurrenceStatusModal(
                                  occurrence.occurrenceId,
                                  "done"
                                )
                              }
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Mark as Done"
                            >
                              <FiCheckCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                openOccurrenceStatusModal(
                                  occurrence.occurrenceId,
                                  "cancelled"
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Cancel Occurrence"
                            >
                              <FiXCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                openOccurrenceStatusModal(
                                  occurrence.occurrenceId,
                                  "postponed"
                                )
                              }
                              className="text-purple-600 hover:text-purple-800 transition-colors"
                              title="Postpone Occurrence"
                            >
                              <FiClock className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Occurrence Status Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {statusModal.action} Occurrence
            </h2>

            <textarea
              placeholder="Enter note..."
              className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              value={statusModal.note}
              onChange={(e) =>
                setStatusModal({ ...statusModal, note: e.target.value })
              }
            />

            {statusModal.action === "done" && (
              <input
                type="number"
                placeholder="Enter cost (optional)"
                className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                value={statusModal.cost}
                onChange={(e) =>
                  setStatusModal({ ...statusModal, cost: e.target.value })
                }
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setStatusModal({
                    open: false,
                    occurrenceId: null,
                    action: null,
                    note: "",
                    cost: "",
                  })
                }
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitOccurrenceStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export default function MaintenanceSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    startDate: "",
    duedate: "",
    category: "",
    frequency: "",
    priority: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await getMaintenanceSchedules();
      const weeklyResponse = await getThisWeekMaintenanceSchedules();
      setWeeklySchedules(weeklyResponse || []);
      setSchedules(response || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch maintenance schedules.");
    } finally {
      setLoading(false);
    }
  };

  const openModalForCreate = () => {
    setEditingScheduleId(null);
    setScheduleForm({
      title: "",
      description: "",
      startDate: "",
      duedate: "",
      category: "",
      frequency: "",
      priority: "",
    });
    setModalOpen(true);
  };

  const openModalForEdit = (schedule) => {
    setEditingScheduleId(schedule.scheduleId);
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
      category: schedule.category || "",
      frequency: schedule.frequency || "",
      priority: schedule.priority || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingScheduleId(null);
  };

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
        // Ensure duedate is null if empty string
        duedate: scheduleForm.duedate || null,
      };

      if (editingScheduleId) {
        await updateMaintenanceSchedule(editingScheduleId, payload);
        toast.success("Schedule updated successfully!", { id: toastId });
      } else {
        await createMaintenanceSchedule(payload);
        toast.success("Schedule created successfully!", { id: toastId });
      }

      closeModal();
      fetchSchedules();
    } catch (err) {
      const errorMessage =
        err.message || err.errors?.[0]?.message || "Failed to save schedule.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    const originalSchedules = [...schedules];
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
      setSchedules(originalSchedules);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header and Action */}
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

      {/* Schedules List */}
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
        ) : schedules.length > 0 ? (
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
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schedules.map((schedule) => (
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
                        Category: {schedule.category || "N/A"} | Frequency:{" "}
                        {schedule.frequency || "Once"}
                      </p>

                      <OccurrencesDropdown
                        occurrences={schedule.occurrences}
                        scheduleId={schedule.scheduleId}
                        onOccurrenceUpdate={fetchSchedules}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(schedule.startDate).toLocaleDateString()}
                      {schedule.duedate && (
                        <span className="block text-xs text-gray-500">
                          Due: {new Date(schedule.duedate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                          schedule.priority
                        )}`}
                      >
                        {schedule.priority || "Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex justify-end items-center gap-2">
                      <button
                        onClick={() => openModalForEdit(schedule)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Schedule"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSchedule(schedule.scheduleId)
                        }
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Schedule"
                      >
                        <FiTrash2 />
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

      {/* This Week's Scheduled Tasks */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-indigo-500" /> This Week's Scheduled Tasks
          ({weeklySchedules.length})
        </h2>
        {weeklySchedules.length > 0 ? (
          <ul className="space-y-4">
            {weeklySchedules.map((occurrence) => (
              <li
                key={occurrence.occurrenceId}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {occurrence.schedule?.title || "Untitled Schedule"}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Occurrence Date:{" "}
                  {new Date(occurrence.occurrenceDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 ${getStatusStyles(
                      occurrence.status
                    )}`}
                  >
                    {getStatusIcon(occurrence.status)} {occurrence.status}
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

      {/* Modal for Scheduling New/Edit Task */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-4/5 max-w-5xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiPlusCircle className="text-indigo-600 w-6 h-6" />{" "}
              {editingScheduleId
                ? "Edit Maintenance Schedule"
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
                  Title *
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
                  Start Date *
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
                  <option value="">Once</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* Description */}
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

              {/* Form Actions */}
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
