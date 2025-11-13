import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getRoomById } from "../services/roomService";
import { toast } from "react-hot-toast";
import {
  X,
  MapPin,
  Layers,
  Maximize2,
  Home,
  CheckCircle,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Tag,
  Car,
  FileText,
} from "lucide-react";

// Helper function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Reusable components
const DetailCard = ({
  icon: Icon,
  label,
  value,
  color = "text-indigo-500",
}) => (
  <div className="flex items-start p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md transition duration-300 hover:shadow-lg">
    <div className={`p-3 rounded-full bg-opacity-10 ${color}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="ml-4">
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const baseClasses =
    "px-3 py-1 text-sm font-semibold rounded-full shadow-inner";
  let colorClasses = "";

  switch (status) {
    case "Rented":
      colorClasses =
        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      break;
    case "Vacant":
      colorClasses =
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      break;
    case "Maintenance":
      colorClasses =
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      break;
    default:
      colorClasses =
        "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoomById(id);
        setRoom(data.room || data); // handle API returning { room } or direct object
      } catch (error) {
        toast.error(error.message || "Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const parkingDisplay = useMemo(() => {
    if (!room) return "N/A";
    if (!room.hasParking) return "No Parking";
    return room.parkingType === "Limited"
      ? `Limited (${room.parkingSpaces} spaces)`
      : room.parkingType;
  }, [room]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
            Loading room details...
          </p>
        </div>
      </div>
    );

  if (!room)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-center px-4">
        <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          Room Not Found
        </p>
        <Link
          to="/manage-rooms"
          className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300"
        >
          Go Back to Rooms
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900  sm:p-8">
      <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900  ">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-6 mb-6 dark:border-gray-700">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Unit {room.unitNumber} Details
          </h1>
          <Link
            to="/manage-rooms"
            className="p-3 rounded-full transition duration-300 bg-gray-100 hover:bg-red-500 dark:bg-gray-700 dark:hover:bg-red-600 group shadow-md"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-white" />
          </Link>
        </div>
        {/* Main Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DetailCard
            icon={MapPin}
            label="Unit Number"
            value={room.unitNumber}
            color="text-indigo-500"
          />
          <DetailCard
            icon={Layers}
            label="Floor Level"
            value={room.floor}
            color="text-green-500"
          />
          <DetailCard
            icon={Maximize2}
            label="Size"
            value={`${room.size} m²`}
            color="text-orange-500"
          />
          <DetailCard
            icon={Home}
            label="Room Type"
            value={room.roomType?.typeName || "N/A"}
            color="text-teal-500"
          />
        </div>
        {/* Status, Parking, and Price Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Current Status */}
          <div className="p-6 bg-indigo-50 dark:bg-gray-700 rounded-2xl shadow-inner border border-indigo-200 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-600" /> Current Status
            </h2>
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {room.status}
              </p>
              <StatusBadge status={room.status} />
            </div>
            {room.roomType?.typeDescription && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Type Description: {room.roomType.typeDescription}
              </p>
            )}
          </div>

          {/* Parking */}
          <div className="p-6 bg-indigo-50 dark:bg-gray-700 rounded-2xl shadow-inner border border-indigo-200 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
              <Car className="w-5 h-5 mr-2 text-indigo-600" /> Parking
            </h2>
            <div className="flex justify-between items-center">
              <p
                className={`text-lg font-medium ${
                  room.hasParking
                    ? "text-gray-800 dark:text-gray-100"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {parkingDisplay}
              </p>
            </div>
          </div>

          {/* Room Price */}
          <div className="p-6 bg-indigo-50 dark:bg-gray-700 rounded-2xl shadow-inner border border-indigo-200 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-indigo-600" /> Room Price
            </h2>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${room.roomPrice?.toLocaleString() || "N/A"}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-10 p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-indigo-600" /> Room Features
          </h2>
          <div className="flex flex-wrap gap-3">
            {room.roomFeatures?.length ? (
              room.roomFeatures.map((f) => (
                <div
                  key={f.roomFeatureId}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium transition duration-200 hover:bg-indigo-700 shadow-md"
                  title={f.featureType?.description || ""}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {f.featureType?.name}
                  {f.count > 1 && (
                    <span className="ml-1.5 opacity-75">({f.count})</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No specific features listed for this room.
              </p>
            )}
          </div>
        </div>

        {/* Rentals */}
        <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
            <Users className="w-6 h-6 mr-2 text-indigo-600" /> Rental History
          </h2>
          {room.rental?.length ? (
            <div className="space-y-4">
              {room.rental.map((r) => (
                <div
                  key={r.rentId}
                  className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-indigo-500 transition duration-300 hover:shadow-xl"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="col-span-2 lg:col-span-1 flex items-center font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-4 h-4 mr-2" />
                      {r.tenant?.contactPerson || "Unknown Tenant"}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(r.startDate)} - {formatDate(r.endDate)}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <DollarSign className="w-4 h-4 mr-2" />$
                      {r.rentAmount?.toFixed(2) || "N/A"} /mo
                    </div>
                    <div className="flex items-center">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No rental history recorded.
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-end pt-4">
          <Link
            to="/manage-rooms"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg"
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    </div>
  );
}
