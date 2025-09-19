import React, { useState } from "react";
import { User, Mail, Phone, Save, ArrowLeft, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, editProfile } = useAuth(); // ✅ use from context
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || "",
  });

  const [preview, setPreview] = useState(
    user?.profilePicture
      ? `http://localhost:3000${user.profilePicture}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.fullName || user?.email || "User"
        )}`
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("phone", formData.phone);
    if (formData.profilePicture instanceof File) {
      form.append("profilePicture", formData.profilePicture);
    }

    try {
      await editProfile(form); // ✅ context handles API + toast
      navigate("/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src={preview}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md dark:border-gray-700 object-cover"
            />
            <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Upload className="w-5 h-5 mr-2" />
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Full Name */}
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
