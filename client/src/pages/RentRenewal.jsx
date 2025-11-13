import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRentalById, renewRental } from "../services/rentalService";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import { X } from "lucide-react";

export default function RentRenewal() {
  const { id } = useParams(); // rental ID
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    newStartDate: "",
    newEndDate: "",
    rentAmount: "",
    paymentInterval: "",
    paymentDueDate: "",
  });

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const data = await getRentalById(id);
        setRental(data);

        // Pre-fill renewal form with old rental details
        setForm({
          newStartDate: new Date(data.endDate).toISOString().split("T")[0],
          newEndDate: "",
          rentAmount: data.rentAmount,
          paymentInterval: data.paymentInterval,
          paymentDueDate: data.paymentDueDate,
        });
      } catch (error) {
        toast.error(error.message || "Failed to fetch rental details");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.newEndDate)
        return toast.error("Please select an end date for the renewal");

      // Transform field names for backend
      const payload = {
        newStartDate: form.newStartDate,
        newEndDate: form.newEndDate,
        newRentAmount: form.rentAmount, // rename here
        paymentInterval: form.paymentInterval,
        paymentDueDate: form.paymentDueDate,
      };

      await renewRental(id, payload);
      toast.success("Rental renewed successfully 🎉");
      navigate("/manage-rentals");
    } catch (error) {
      toast.error(error.message || "Failed to renew rental");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-600 animate-pulse">
          Loading rental renewal form... ⏳
        </p>
      </div>
    );

  if (!rental)
    return (
      <div className="text-center p-10 bg-red-100 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-red-700">
          Rental not found 😔
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FiCalendar className="text-indigo-600" />
          Renew Rental —{" "}
          <span className="text-indigo-600">
            {rental.tenant?.contactPerson}
          </span>
        </h1>
        <Link
          to="/manage-rentals"
          className="p-3 rounded-full bg-gray-100 hover:bg-red-500 dark:bg-gray-700 dark:hover:bg-red-600 transition duration-300 group"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-white" />
        </Link>
      </div>

      {/* Current Rental Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <InfoCard title="Current Rental Info" icon={FiHome}>
          <DetailItem label="Unit Number" value={rental.room?.unitNumber} />
          <DetailItem label="Floor" value={rental.room?.floor} />
          <DetailItem label="Rent Amount" value={`$${rental.rentAmount}`} />
          <DetailItem
            label="End Date"
            value={new Date(rental.endDate).toLocaleDateString()}
          />
        </InfoCard>

        <InfoCard title="Tenant Info" icon={FiUsers}>
          <DetailItem label="Company" value={rental.tenant?.companyName} />
          <DetailItem
            label="Contact Person"
            value={rental.tenant?.contactPerson}
          />
          <DetailItem label="Phone" value={rental.tenant?.phone} />
          <DetailItem label="Email" value={rental.tenant?.email} />
        </InfoCard>
      </div>

      {/* Renewal Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 border-b pb-3">
          <FiCheckCircle className="text-indigo-500" />
          Renewal Details
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            label="New Start Date"
            type="date"
            name="newStartDate"
            value={form.newStartDate}
            onChange={handleChange}
          />
          <FormField
            label="New End Date"
            type="date"
            name="newEndDate"
            value={form.newEndDate}
            onChange={handleChange}
          />
          <FormField
            label="Rent Amount ($)"
            type="number"
            name="rentAmount"
            value={form.rentAmount}
            onChange={handleChange}
          />
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Interval
            </label>
            <select
              name="paymentInterval"
              value={form.paymentInterval}
              onChange={handleChange}
              className="p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">Select Interval</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <FormField
            label="Payment Due Day"
            type="number"
            name="paymentDueDate"
            value={form.paymentDueDate}
            onChange={handleChange}
          />

          <div className="md:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300 flex items-center gap-2"
            >
              <FiClock className="w-5 h-5" />
              Renew Rental
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 🔹 Reusable Components */
const InfoCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
    <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2 border-b pb-2">
      {Icon && <Icon className="text-indigo-500 w-5 h-5" />}
      {title}
    </h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <p className="flex justify-between items-center text-sm">
    <span className="text-gray-500 dark:text-gray-400 font-medium">
      {label}:
    </span>
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      {value || "N/A"}
    </span>
  </p>
);

const FormField = ({ label, type, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
      required
    />
  </div>
);
