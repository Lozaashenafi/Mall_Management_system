import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Assuming these service imports are correct
import {
  getFeatureTypes,
  createFeatureType,
  updateFeatureType,
  deleteFeatureType,
  getRoomFeatures,
  createRoomFeature,
  updateRoomFeature,
  deleteRoomFeature,
} from "../services/roomFeatureService";
import { getRooms } from "../services/roomService";

// Helper components for improved readability (Optional, but good practice)
const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center p-6 text-lg font-medium text-blue-600 dark:text-blue-400">
    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
    {text}
  </div>
);

const ActionButton = ({ onClick, icon: Icon, title, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition duration-150 ease-in-out ${className}`}
    title={title}
    aria-label={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

// Main Component
export default function RoomFeatureManage() {
  const [featureTypes, setFeatureTypes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [showFeatureTypeForm, setShowFeatureTypeForm] = useState(false);
  const [showFeatureForm, setShowFeatureForm] = useState(false);

  const [editingType, setEditingType] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);

  const emptyType = { name: "", description: "" };
  const emptyFeature = { roomId: "", featureTypeId: "", count: 1 };

  const [newFeatureType, setNewFeatureType] = useState(emptyType);
  const [newFeature, setNewFeature] = useState(emptyFeature);

  // ---------------- Utility/Helper Functions ----------------
  const featureTypeIdOf = (f) =>
    f.featureTypeId ?? f.id ?? f.featureType?.featureTypeId;
  const featureTypeName = (f) => f.name ?? f.featureType?.name ?? "Unknown";
  const roomNameFor = (r) =>
    r.name ??
    (r.unitNumber ? `Unit ${r.unitNumber}` : `Room ${r.id ?? r.roomId}`);

  const closeModal = (formType) => {
    if (formType === "type") {
      setShowFeatureTypeForm(false);
      setEditingType(null);
      setNewFeatureType(emptyType);
    } else {
      setShowFeatureForm(false);
      setEditingFeature(null);
      setNewFeature(emptyFeature);
    }
  };

  // ---------------- Fetch data ----------------
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, featuresRes, roomsRes] = await Promise.allSettled([
        getFeatureTypes(),
        getRoomFeatures(),
        getRooms(),
      ]);

      const types =
        typesRes.status === "fulfilled"
          ? typesRes.value?.featureTypes ??
            typesRes.value?.data?.featureTypes ??
            []
          : [];
      const features =
        featuresRes.status === "fulfilled"
          ? featuresRes.value?.roomFeatures ??
            featuresRes.value?.data?.roomFeatures ??
            []
          : [];
      const rooms =
        roomsRes.status === "fulfilled"
          ? roomsRes.value?.rooms ?? roomsRes.value?.data?.rooms ?? []
          : [];

      setFeatureTypes(types);
      setFeatures(features);
      setRooms(rooms);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Feature Type Handlers ----------------
  const openAddType = () => {
    setEditingType(null);
    setNewFeatureType(emptyType);
    setShowFeatureTypeForm(true);
  };

  const openEditType = (type) => {
    setEditingType(type);
    // normalize possible id fields
    setNewFeatureType({
      name: type.name ?? "",
      description: type.description ?? "",
    });
    setShowFeatureTypeForm(true);
  };

  const handleFeatureTypeSubmit = async (e) => {
    e.preventDefault();
    if (!newFeatureType.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoadingAction(true);
    try {
      if (editingType) {
        // backend expects id param named featureTypeId
        const id = editingType.featureTypeId ?? editingType.id;
        await updateFeatureType(id, newFeatureType);
        toast.success("Feature Type updated successfully!");
      } else {
        await createFeatureType(newFeatureType);
        toast.success("Feature Type created successfully!");
      }
      closeModal("type");
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err?.message ?? "Failed to save feature type";
      toast.error(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteType = async (type) => {
    const id = type.featureTypeId ?? type.id;
    if (
      !window.confirm(
        `Are you sure you want to delete the feature type: "${type.name}"? This action cannot be undone.`
      )
    )
      return;
    setLoadingAction(true);
    try {
      await deleteFeatureType(id);
      toast.success("Feature type deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Failed to delete feature type");
    } finally {
      setLoadingAction(false);
    }
  };

  // ---------------- Room Feature Handlers ----------------
  const openAddFeature = () => {
    setEditingFeature(null);
    setNewFeature(emptyFeature);
    setShowFeatureForm(true);
  };

  const openEditFeature = (feature) => {
    setEditingFeature(feature);
    setNewFeature({
      roomId: feature.roomId ?? feature.room?.roomId ?? "",
      featureTypeId:
        (feature.featureTypeId ??
          feature.featureType?.featureTypeId ??
          feature.featureType?.id) ||
        "",
      count: feature.count ?? 1,
    });
    setShowFeatureForm(true);
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!newFeature.roomId || !newFeature.featureTypeId) {
      toast.error("Please select a room and a feature type.");
      return;
    }

    setLoadingAction(true);
    try {
      const payload = {
        roomId: Number(newFeature.roomId),
        featureTypeId: Number(newFeature.featureTypeId),
        count: Number(newFeature.count),
      };

      if (editingFeature) {
        const id = editingFeature.roomFeatureId ?? editingFeature.id;
        await updateRoomFeature(id, payload);
        toast.success("Room feature updated successfully!");
      } else {
        await createRoomFeature(payload);
        toast.success("Room feature created successfully!");
      }
      closeModal("feature");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save room feature");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteFeature = async (feature) => {
    const id = feature.roomFeatureId ?? feature.id;
    const roomName = roomNameFor(
      rooms.find(
        (r) => (r.roomId ?? r.id) === (feature.roomId ?? feature.room?.roomId)
      ) || feature
    );
    const featureName = featureTypeName(feature);

    if (
      !window.confirm(
        `Are you sure you want to remove the feature "${featureName}" from ${roomName}?`
      )
    )
      return;

    setLoadingAction(true);
    try {
      await deleteRoomFeature(id);
      toast.success("Room feature deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Failed to delete room feature");
    } finally {
      setLoadingAction(false);
    }
  };

  // ---------------- Render Logic ----------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Room Feature Management 🔑
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage global feature types and assign features to individual rooms.
          </p>
        </div>

        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={openAddType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50"
            disabled={loadingAction}
          >
            <PlusCircle className="w-4 h-4" />
            Add Feature Type
          </button>
          <button
            onClick={openAddFeature}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 transition duration-150 ease-in-out disabled:opacity-50"
            disabled={loadingAction}
          >
            <PlusCircle className="w-4 h-4" />
            Add Room Feature
          </button>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-6" />

      {/* Loading State */}
      {loading && <LoadingSpinner text="Fetching all room data..." />}

      {!loading && (
        <div className="space-y-8">
          {/* Feature Types Table */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
            <h2 className="text-xl font-bold p-4 border-b border-gray-100 dark:border-gray-700">
              Feature Types (Global)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {featureTypes.length > 0 ? (
                    featureTypes.map((type, index) => (
                      <tr
                        key={featureTypeIdOf(type) ?? index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition duration-100"
                      >
                        <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="p-4 font-semibold">{type.name}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 max-w-sm truncate">
                          {type.description || "No description provided."}
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <ActionButton
                            onClick={() => openEditType(type)}
                            icon={Pencil}
                            title="Edit Feature Type"
                            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700"
                          />
                          <ActionButton
                            onClick={() => handleDeleteType(type)}
                            icon={Trash2}
                            title="Delete Feature Type"
                            className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700"
                            disabled={loadingAction}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center p-6 text-gray-500 dark:text-gray-400"
                      >
                        No feature types have been defined yet. Click "Add
                        Feature Type" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Features Table */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
            <h2 className="text-xl font-bold p-4 border-b border-gray-100 dark:border-gray-700">
              Room Features (Assignment)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4">Room</th>
                    <th className="p-4">Feature Type</th>
                    <th className="p-4">Count</th>
                    <th className="p-4 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {features.length > 0 ? (
                    features.map((feature) => {
                      const room =
                        rooms.find(
                          (r) =>
                            (r.roomId ?? r.id) ===
                            (feature.roomId ?? feature.room?.roomId)
                        ) ?? null;

                      const type =
                        featureTypes.find(
                          (t) =>
                            (t.featureTypeId ?? t.id) ===
                            (feature.featureTypeId ??
                              feature.featureType?.featureTypeId ??
                              feature.featureType?.id)
                        ) ?? feature.featureType;

                      const key =
                        feature.roomFeatureId ??
                        feature.id ??
                        `${feature.roomId}-${feature.featureTypeId}`;

                      return (
                        <tr
                          key={key}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition duration-100"
                        >
                          <td className="p-4 font-semibold">
                            {room
                              ? roomNameFor(room)
                              : `Room ID: ${feature.roomId}`}
                          </td>
                          <td className="p-4">
                            {type ? featureTypeName(type) : "Unknown Feature"}
                          </td>
                          <td className="p-4 font-mono">{feature.count}</td>
                          <td className="p-4 text-right space-x-1">
                            <ActionButton
                              onClick={() => openEditFeature(feature)}
                              icon={Pencil}
                              title="Edit Room Feature"
                              className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700"
                            />
                            <ActionButton
                              onClick={() => handleDeleteFeature(feature)}
                              icon={Trash2}
                              title="Delete Room Feature"
                              className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700"
                              disabled={loadingAction}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center p-6 text-gray-500 dark:text-gray-400"
                      >
                        No room features have been assigned yet. Click "Add Room
                        Feature" to assign one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feature Type Modal (Add/Edit) */}
      {showFeatureTypeForm && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feature-type-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="feature-type-modal-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {editingType ? "Edit Feature Type" : "Add New Feature Type"}
                </h2>
                <ActionButton
                  onClick={() => closeModal("type")}
                  icon={X}
                  title="Close"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                />
              </div>

              <form onSubmit={handleFeatureTypeSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="typeName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="typeName"
                    type="text"
                    placeholder=""
                    value={newFeatureType.name}
                    onChange={(e) =>
                      setNewFeatureType({
                        ...newFeatureType,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="typeDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="typeDescription"
                    placeholder="Brief description of the feature."
                    value={newFeatureType.description}
                    onChange={(e) =>
                      setNewFeatureType({
                        ...newFeatureType,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => closeModal("type")}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-150 flex items-center"
                  >
                    {loadingAction && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingType
                      ? loadingAction
                        ? "Updating..."
                        : "Update Type"
                      : loadingAction
                      ? "Adding..."
                      : "Add Type"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Room Feature Modal (Add/Edit) */}
      {showFeatureForm && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-feature-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="room-feature-modal-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {editingFeature ? "Edit Room Feature" : "Assign Room Feature"}
                </h2>
                <ActionButton
                  onClick={() => closeModal("feature")}
                  icon={X}
                  title="Close"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                />
              </div>

              <form onSubmit={handleFeatureSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="roomSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Select Room
                  </label>
                  <select
                    id="roomSelect"
                    value={newFeature.roomId}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        roomId: Number(e.target.value) || "",
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                    required
                    disabled={editingFeature} // Prevent changing room on edit
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map((r) => (
                      <option key={r.roomId ?? r.id} value={r.roomId ?? r.id}>
                        {roomNameFor(r)}
                      </option>
                    ))}
                  </select>
                  {editingFeature && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Room cannot be changed when editing an existing feature.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="featureTypeSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Select Feature Type
                  </label>
                  <select
                    id="featureTypeSelect"
                    value={newFeature.featureTypeId}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        featureTypeId: Number(e.target.value) || "",
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                    required
                    disabled={editingFeature} // Prevent changing feature type on edit
                  >
                    <option value="">-- Select Feature Type --</option>
                    {featureTypes.map((f) => (
                      <option
                        key={featureTypeIdOf(f)}
                        value={featureTypeIdOf(f)}
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                  {editingFeature && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Feature Type cannot be changed when editing an existing
                      feature.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="countInput"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Count
                  </label>
                  <input
                    id="countInput"
                    type="number"
                    min="1"
                    placeholder="Count"
                    value={newFeature.count}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        count: Number(e.target.value || 1),
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => closeModal("feature")}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition duration-150 flex items-center"
                  >
                    {loadingAction && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingFeature
                      ? loadingAction
                        ? "Updating..."
                        : "Update Feature"
                      : loadingAction
                      ? "Adding..."
                      : "Assign Feature"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
