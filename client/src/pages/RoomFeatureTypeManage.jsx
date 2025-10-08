import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RoomFeatureManage() {
  const [featureTypes, setFeatureTypes] = useState([
    { id: 1, name: "Window", description: "Natural light access" },
    { id: 2, name: "Balcony", description: "Outdoor view" },
  ]);

  const [features, setFeatures] = useState([
    { id: 1, roomId: 101, featureTypeId: 1, count: 2 },
    { id: 2, roomId: 102, featureTypeId: 2, count: 1 },
  ]);

  const [rooms, setRooms] = useState([
    { roomId: 101, name: "Room 101" },
    { roomId: 102, name: "Room 102" },
  ]);

  const [showFeatureTypeForm, setShowFeatureTypeForm] = useState(false);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);

  const [newFeatureType, setNewFeatureType] = useState({
    name: "",
    description: "",
  });
  const [newFeature, setNewFeature] = useState({
    roomId: "",
    featureTypeId: "",
    count: 1,
  });

  // ---- Add or Edit Feature Type ----
  const handleFeatureTypeSubmit = (e) => {
    e.preventDefault();
    if (!newFeatureType.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingType) {
      setFeatureTypes((prev) =>
        prev.map((f) =>
          f.id === editingType.id ? { ...f, ...newFeatureType } : f
        )
      );
      toast.success("Feature Type updated!");
    } else {
      setFeatureTypes((prev) => [
        { id: Date.now(), ...newFeatureType },
        ...prev,
      ]);
      toast.success("Feature Type added!");
    }
    setNewFeatureType({ name: "", description: "" });
    setEditingType(null);
    setShowFeatureTypeForm(false);
  };

  // ---- Add or Edit Room Feature ----
  const handleFeatureSubmit = (e) => {
    e.preventDefault();
    if (!newFeature.roomId || !newFeature.featureTypeId) {
      toast.error("Select room and feature type");
      return;
    }

    if (editingFeature) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === editingFeature.id ? { ...f, ...newFeature } : f
        )
      );
      toast.success("Feature updated!");
    } else {
      setFeatures((prev) => [{ id: Date.now(), ...newFeature }, ...prev]);
      toast.success("Feature added!");
    }

    setNewFeature({ roomId: "", featureTypeId: "", count: 1 });
    setEditingFeature(null);
    setShowFeatureForm(false);
  };

  const handleDeleteType = (id) => {
    if (!window.confirm("Delete this feature type?")) return;
    setFeatureTypes((prev) => prev.filter((t) => t.id !== id));
    toast.success("Deleted!");
  };

  const handleDeleteFeature = (id) => {
    if (!window.confirm("Delete this feature?")) return;
    setFeatures((prev) => prev.filter((t) => t.id !== id));
    toast.success("Deleted!");
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Feature Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage room features and feature types
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowFeatureTypeForm(true);
              setEditingType(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            Add Feature Type
          </button>
          <button
            onClick={() => {
              setShowFeatureForm(true);
              setEditingFeature(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <PlusCircle className="w-4 h-4" />
            Add Room Feature
          </button>
        </div>
      </div>

      {/* ---------- Feature Type Table ---------- */}
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
                  key={type.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{type.name}</td>
                  <td className="p-3">{type.description}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingType(type);
                        setNewFeatureType(type);
                        setShowFeatureTypeForm(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-400"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteType(type.id)}
                      className="p-2 text-red-600 hover:text-red-400"
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

      {/* ---------- Room Feature Table ---------- */}
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
                const room = rooms.find((r) => r.roomId === feature.roomId);
                const type = featureTypes.find(
                  (t) => t.id === feature.featureTypeId
                );
                return (
                  <tr
                    key={feature.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">{room?.name || feature.roomId}</td>
                    <td className="p-3">{type?.name || "Unknown"}</td>
                    <td className="p-3">{feature.count}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingFeature(feature);
                          setNewFeature(feature);
                          setShowFeatureForm(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-2 text-red-600 hover:text-red-400"
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

      {/* ---------- Feature Type Modal ---------- */}
      {showFeatureTypeForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-40">
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
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeatureTypeForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  {editingType ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Room Feature Modal ---------- */}
      {showFeatureForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-40">
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
                    roomId: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                value={newFeature.featureTypeId}
                onChange={(e) =>
                  setNewFeature({
                    ...newFeature,
                    featureTypeId: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              >
                <option value="">Select Feature Type</option>
                {featureTypes.map((f) => (
                  <option key={f.id} value={f.id}>
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
                    count: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeatureForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                >
                  {editingFeature ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
