import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Shield,
  Camera,
  AlertTriangle,
  Users,
  Clipboard,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  Key,
  UserCheck,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const securityOfficerSidebarItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/security/dashboard" },
  { title: "Notifications", icon: Bell, url: "/security/notifications" },
  { title: "Settings", icon: Settings, url: "/security/settings" },
];

export function SecurityOfficerSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!mounted) return null;

  const SidebarContent = (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 dark:bg-gray-900 dark:border-gray-700">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 flex items-center justify-between
                   dark:border-gray-700"
      >
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Security Panel
            </span>
          </div>
        )}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(false);
            } else {
              onToggle();
            }
          }}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {securityOfficerSidebarItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon
                className={`flex-shrink-0 w-5 h-5 transition-colors ${
                  collapsed ? "mx-auto" : "mr-3"
                }`}
              />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
              )}
            </NavLink>
          );
        })}

        {/* Logout Button (Separate Styling) */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            text-red-600 hover:bg-red-50 hover:text-red-700 
            dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300`}
        >
          <LogOut
            className={`flex-shrink-0 w-5 h-5 transition-colors ${
              collapsed ? "mx-auto" : "mr-3"
            }`}
          />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </nav>

      {/* Footer with User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && user && (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
              {user.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "SO"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.fullName || "Security Officer"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                Security Officer
              </p>
              {user.assignedProperty && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate mt-1">
                  {user.assignedProperty}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {collapsed && user && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
              {user.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "SO"}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{SidebarContent}</div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="bg-black/50 flex-1"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50">{SidebarContent}</div>
        </div>
      )}

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-600"
        onClick={() => setMobileOpen(true)}
      >
        <Shield className="w-5 h-5" />
      </button>
    </>
  );
}
