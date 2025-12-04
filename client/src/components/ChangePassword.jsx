import React, { useState } from "react";
import { Lock, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword, isTenant, isSecurityOfficer } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      navigate("/profile"); // redirect after success
    } catch (err) {
      // toast handled inside context
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Current Password"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* New Password */}
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() =>
                isTenant
                  ? navigate("/tenant/profile")
                  : isSecurityOfficer
                  ? navigate("/security/profile")
                  : navigate("/profile")
              }
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
