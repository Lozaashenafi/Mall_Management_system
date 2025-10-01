import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center space-x-3 mb-4">
        {Icon && (
          <div className="p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

const ListItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <span className="text-gray-600 dark:text-gray-300 font-medium">
        {label}:
      </span>
      <span className="flex-1 text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
};

const Profile = () => {
  const { user, logout, isTenant } = useAuth();
  console.log("user:", user);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        No user data available.
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-8 rounded-xl border border-gray-200 bg-white shadow-md flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 dark:border-gray-700 dark:bg-gray-800">
        <img
          src={
            `http://localhost:3000${user.profilePicture}` ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(user.fullName || user.email)
          }
          alt="User Profile"
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg dark:border-gray-700"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {user.fullName || "Unnamed User"}
          </h1>
          <p className="text-lg text-purple-600 font-medium dark:text-purple-400">
            {user.role || "User"}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This is your personal profile page. You can view and update your
            information here.
          </p>
        </div>
        <button
          onClick={() =>
            isTenant
              ? navigate("/tenant/edit-profile")
              : navigate("/edit-profile")
          }
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5 mr-1 -rotate-90 md:rotate-0" />
          Edit Profile
        </button>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard title="Contact Information" icon={Mail}>
          <div className="space-y-2">
            <ListItem icon={Mail} label="Email" value={user.email} />
            <ListItem icon={Phone} label="Phone" value={user.phone || "N/A"} />
          </div>
        </ProfileCard>
      </div>

      {/* Account Settings */}
      <ProfileCard title="Account Settings" icon={Lock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() =>
              isTenant
                ? navigate("/tenant/change-password")
                : navigate("/change-password")
            }
            className="flex justify-between items-center w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            <span>Change Password</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex justify-between items-center w-full px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          >
            <span>Log Out</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </ProfileCard>
    </div>
  );
};

export default Profile;
