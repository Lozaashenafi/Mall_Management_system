import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Save,
} from "lucide-react";

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "AdminPro Dashboard",
    siteDescription: "Professional admin dashboard for managing your business",
    timezone: "UTC-5",
    language: "English",
    maintenanceMode: false,
  });

  const [profileSettings, setProfileSettings] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Super Admin",
    twoFactorEnabled: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiry: "90",
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    requireTwoFactor: true,
  });

  const updateGeneralSetting = (key, value) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };
  const updateNotificationSetting = (key, value) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
  };
  const updateSecuritySetting = (key, value) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: value }));
  };

  // Simple Tabs logic
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6 space-y-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your application settings and preferences
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      {/* Tabs navigation */}
      <nav className="grid grid-cols-5 border-b border-gray-300 dark:border-gray-700">
        {[
          {
            id: "general",
            label: "General",
            icon: <SettingsIcon className="w-4 h-4" />,
          },
          {
            id: "profile",
            label: "Profile",
            icon: <User className="w-4 h-4" />,
          },
          {
            id: "security",
            label: "Security",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: <Bell className="w-4 h-4" />,
          },
          {
            id: "appearance",
            label: "Appearance",
            icon: <Palette className="w-4 h-4" />,
          },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 ${
              activeTab === id
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            } transition`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Tabs content */}
      <section>
        {/* General */}
        {activeTab === "general" && (
          <section className="space-y-6 bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">General Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure basic application settings
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="siteName"
                  className="block text-sm font-medium mb-1"
                >
                  Site Name
                </label>
                <input
                  id="siteName"
                  type="text"
                  className="w-full rounded border bg-white text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    updateGeneralSetting("siteName", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium mb-1"
                >
                  Timezone
                </label>
                <input
                  id="timezone"
                  type="text"
                  className="w-full bg-white text-gray-500 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={generalSettings.timezone}
                  onChange={(e) =>
                    updateGeneralSetting("timezone", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="siteDescription"
                className="block text-sm font-medium mb-1"
              >
                Site Description
              </label>
              <input
                id="siteDescription"
                type="text"
                className="w-full rounded border bg-white text-gray-500 border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={generalSettings.siteDescription}
                onChange={(e) =>
                  updateGeneralSetting("siteDescription", e.target.value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="maintenanceMode"
                  className="block text-sm font-medium"
                >
                  Maintenance Mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable maintenance mode to restrict access
                </p>
              </div>
              <input
                id="maintenanceMode"
                type="checkbox"
                className="h-5 w-5 bg-white  cursor-pointer rounded border border-gray-400 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                checked={generalSettings.maintenanceMode}
                onChange={(e) =>
                  updateGeneralSetting("maintenanceMode", e.target.checked)
                }
              />
            </div>
          </section>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <section className="space-y-6 bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your personal information
            </p>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300">
                AU
              </div>
              <div>
                <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition">
                  Change Avatar
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="profileName"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  id="profileName"
                  type="text"
                  className="w-full bg-white text-gray-500 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={profileSettings.name}
                  onChange={(e) =>
                    setProfileSettings((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="profileEmail"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  className="w-full bg-white text-gray-500 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={profileSettings.email}
                  onChange={(e) =>
                    setProfileSettings((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Role
              </label>
              <input
                id="role"
                type="text"
                className="w-full rounded border border-gray-300 bg-white text-gray-500 px-3 py-2  cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                value={profileSettings.role}
                disabled
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <label className="block text-sm font-medium">
                  Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileSettings.twoFactorEnabled}
                onChange={(e) =>
                  setProfileSettings((p) => ({
                    ...p,
                    twoFactorEnabled: e.target.checked,
                  }))
                }
                className="h-5 w-5 bg-white  cursor-pointer rounded border border-gray-400 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </section>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <section className="space-y-6 bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure security and access controls
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="passwordExpiry"
                  className="block text-sm font-medium mb-1"
                >
                  Password Expiry (days)
                </label>
                <input
                  id="passwordExpiry"
                  type="number"
                  className="w-full rounded bg-white text-gray-500 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) =>
                    updateSecuritySetting("passwordExpiry", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="sessionTimeout"
                  className="block text-sm font-medium mb-1"
                >
                  Session Timeout (minutes)
                </label>
                <input
                  id="sessionTimeout"
                  type="number"
                  className="w-full bg-white text-gray-500 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    updateSecuritySetting("sessionTimeout", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="maxLoginAttempts"
                className="block text-sm font-medium mb-1"
              >
                Max Login Attempts
              </label>
              <input
                id="maxLoginAttempts"
                type="number"
                className="w-full bg-white text-gray-500 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) =>
                  updateSecuritySetting("maxLoginAttempts", e.target.value)
                }
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <div>
                <label className="block text-sm font-medium">
                  Require Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Force all users to enable 2FA
                </p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.requireTwoFactor}
                onChange={(e) =>
                  updateSecuritySetting("requireTwoFactor", e.target.checked)
                }
                className="h-5 w-5 cursor-pointer rounded border border-gray-400 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </section>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <section className="space-y-6 bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">
              Notification Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose how you want to receive notifications
            </p>

            {[
              {
                key: "emailNotifications",
                label: "Email Notifications",
                description: "Receive notifications via email",
                checked: notificationSettings.emailNotifications,
              },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                description: "Receive browser push notifications",
                checked: notificationSettings.pushNotifications,
              },
              {
                key: "smsNotifications",
                label: "SMS Notifications",
                description: "Receive notifications via SMS",
                checked: notificationSettings.smsNotifications,
              },
              {
                key: "marketingEmails",
                label: "Marketing Emails",
                description: "Receive product updates and offers",
                checked: notificationSettings.marketingEmails,
              },
            ].map(({ key, label, description, checked }) => (
              <div
                key={key}
                className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 py-3 last:border-b-0"
              >
                <div>
                  <label className="block text-sm font-medium">{label}</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    updateNotificationSetting(key, e.target.checked)
                  }
                  className="h-5 w-5 cursor-pointer rounded border border-gray-400 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </section>
        )}

        {/* Appearance */}
        {activeTab === "appearance" && (
          <section className="space-y-6 bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Appearance Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customize the look and feel of your dashboard
            </p>

            <div className="grid grid-cols-3 gap-6">
              {/* Light Theme */}
              <button
                type="button"
                className="cursor-pointer border-2 border-purple-600 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-600"
                aria-label="Light Theme"
                // onClick={} add your theme switching logic here
              >
                <div className="w-full h-20 bg-gradient-to-br from-purple-500 to-purple-600"></div>
                <p className="text-center p-2 text-sm text-gray-900 dark:text-gray-100">
                  Light Theme
                </p>
              </button>

              {/* Dark Theme */}
              <button
                type="button"
                className="cursor-pointer border border-gray-300 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-600"
                aria-label="Dark Theme"
              >
                <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                <p className="text-center p-2 text-sm text-gray-900 dark:text-gray-100">
                  Dark Theme
                </p>
              </button>

              {/* Auto Theme */}
              <button
                type="button"
                className="cursor-pointer border border-gray-300 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-600"
                aria-label="Auto Theme"
              >
                <div className="w-full h-20 bg-gradient-to-br from-purple-500 to-gray-800"></div>
                <p className="text-center p-2 text-sm text-gray-900 dark:text-gray-100">
                  Auto
                </p>
              </button>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
