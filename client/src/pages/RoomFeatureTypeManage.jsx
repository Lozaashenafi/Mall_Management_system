import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";

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
        typesRes.value?.featureTypes ??
        typesRes.value?.data?.featureTypes ??
        [];
      const features =
        featuresRes.value?.roomFeatures ??
        featuresRes.value?.data?.roomFeatures ??
        [];
      const rooms = roomsRes.value?.rooms ?? roomsRes.value?.data?.rooms ?? [];

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
        toast.success("Feature Type updated");
      } else {
        await createFeatureType(newFeatureType);
        toast.success("Feature Type created");
      }
      setShowFeatureTypeForm(false);
      setEditingType(null);
      setNewFeatureType(emptyType);
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
    if (!window.confirm("Delete this feature type?")) return;
    setLoadingAction(true);
    try {
      await deleteFeatureType(id);
      toast.success("Feature type deleted");
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
      toast.error("Select room and feature type");
      return;
    }

    setLoadingAction(true);
    try {
      if (editingFeature) {
        const id =
          editingFeature.roomFeatureId ??
          editingFeature.id ??
          editingFeature.roomFeatureId;
        await updateRoomFeature(id, {
          roomId: Number(newFeature.roomId),
          featureTypeId: Number(newFeature.featureTypeId),
          count: Number(newFeature.count),
        });
        toast.success("Room feature updated");
      } else {
        await createRoomFeature({
          roomId: Number(newFeature.roomId),
          featureTypeId: Number(newFeature.featureTypeId),
          count: Number(newFeature.count),
        });
        toast.success("Room feature created");
      }
      setShowFeatureForm(false);
      setEditingFeature(null);
      setNewFeature(emptyFeature);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save room feature");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteFeature = async (feature) => {
    const id = feature.roomFeatureId ?? feature.id ?? feature.roomFeatureId;
    if (!window.confirm("Delete this room feature?")) return;
    setLoadingAction(true);
    try {
      await deleteRoomFeature(id);
      toast.success("Room feature deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Failed to delete room feature");
    } finally {
      setLoadingAction(false);
    }
  };

  const featureTypeIdOf = (f) =>
    f.featureTypeId ?? f.id ?? f.featureType?.featureTypeId;
  const featureTypeName = (f) => f.name ?? f.featureType?.name ?? "Unknown";
  const roomNameFor = (r) => r.name ?? `Room ${r.unitNumber}`;

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Feature Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage room features and feature types
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAddType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            Add Feature Type
          </button>
          <button
            onClick={openAddFeature}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <PlusCircle className="w-4 h-4" />
            Add Room Feature
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="p-6 bg-white dark:bg-gray-900 border rounded text-center">
          Loading...
        </div>
      ) : (
        <>
          {/* Feature Types Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Feature Types</h2>
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featureTypes.length > 0 ? (
                  featureTypes.map((type, index) => (
                    <tr
                      key={featureTypeIdOf(type) ?? index}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{type.name}</td>
                      <td className="p-3">{type.description}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openEditType(type)}
                          className="p-2 text-blue-600 hover:text-blue-400"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type)}
                          className="p-2 text-red-600 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No feature types yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Room Features Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Room Features</h2>
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3">Room</th>
                  <th className="p-3">Feature Type</th>
                  <th className="p-3">Count</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.length > 0 ? (
                  features.map((feature) => {
                    // match room name
                    const room =
                      rooms.find(
                        (r) =>
                          (r.roomId ?? r.id) ===
                          (feature.roomId ?? feature.room?.roomId)
                      ) ??
                      rooms.find((r) => r.roomId === feature.roomId) ??
                      null;

                    // find feature type in list first, fallback to nested relation
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
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3">
                          {room ? roomNameFor(room) : feature.roomId}
                        </td>
                        <td className="p-3">
                          {type ? featureTypeName(type) : "Unknown"}
                        </td>
                        <td className="p-3">{feature.count}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => openEditFeature(feature)}
                            className="p-2 text-blue-600 hover:text-blue-400"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature)}
                            className="p-2 text-red-600 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No room features yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showFeatureTypeForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingType ? "Edit Feature Type" : "Add Feature Type"}
            </h2>
            <form onSubmit={handleFeatureTypeSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Feature name"
                value={newFeatureType.name}
                onChange={(e) =>
                  setNewFeatureType({ ...newFeatureType, name: e.target.value })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                required
              />
              <textarea
                placeholder="Description"
                value={newFeatureType.description}
                onChange={(e) =>
                  setNewFeatureType({
                    ...newFeatureType,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeatureTypeForm(false);
                    setEditingType(null);
                    setNewFeatureType(emptyType);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                >
                  {editingType
                    ? loadingAction
                      ? "Updating..."
                      : "Update"
                    : loadingAction
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeatureForm && (
        <div className="fixed inset-0  bg-black/50 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingFeature ? "Edit Room Feature" : "Add Room Feature"}
            </h2>
            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <select
                value={newFeature.roomId}
                onChange={(e) =>
                  setNewFeature({
                    ...newFeature,
                    roomId: Number(e.target.value) || "",
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                required
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r.roomId ?? r.id} value={r.roomId ?? r.id}>
                    {roomNameFor(r)}
                  </option>
                ))}
              </select>

              <select
                value={newFeature.featureTypeId}
                onChange={(e) =>
                  setNewFeature({
                    ...newFeature,
                    featureTypeId: Number(e.target.value) || "",
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                required
              >
                <option value="">Select Feature Type</option>
                {featureTypes.map((f) => (
                  <option key={featureTypeIdOf(f)} value={featureTypeIdOf(f)}>
                    {f.name}
                  </option>
                ))}
              </select>

              <input
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
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeatureForm(false);
                    setEditingFeature(null);
                    setNewFeature(emptyFeature);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 disabled:opacity-50"
                >
                  {editingFeature
                    ? loadingAction
                      ? "Updating..."
                      : "Update"
                    : loadingAction
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
