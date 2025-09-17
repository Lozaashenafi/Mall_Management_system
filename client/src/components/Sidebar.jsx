import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Wrench,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Receipt,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseSidebarItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Tenants", icon: Users, url: "/manage-tenants" },
  { title: "Rooms", icon: Building2, url: "/manage-rooms" },
  { title: "Payments", icon: DollarSign, url: "/payments" },
  { title: "Maintenance", icon: Wrench, url: "/maintenance" },
  { title: "Expenses", icon: Receipt, url: "/expenses" },
  { title: "Statistics", icon: BarChart3, url: "/statistics" },
  { title: "Logs", icon: History, url: "/logs" },
  { title: "Reports", icon: FileText, url: "/reports" },
  { title: "Notifications", icon: Bell, url: "/notifications" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

// Extra items only for SuperAdmin
const superAdminItems = [{ title: "Users", icon: Users, url: "/manage-users" }];

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Build final sidebar items based on role
  let sidebarItems = [...baseSidebarItems];
  console.log("User role:", user?.role);
  if (user?.role === "SuperAdmin") {
    sidebarItems = [...superAdminItems, ...sidebarItems];
  }

  const SidebarContent = (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 dark:bg-gray-900 dark:border-gray-700">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 flex items-center justify-between
                   dark:border-gray-700"
      >
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              MallManager
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
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow-sm"
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
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer with User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && user && (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
              {user.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.fullName || "Unnamed User"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
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
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
        onClick={() => setMobileOpen(true)}
      >
        <LayoutDashboard className="w-5 h-5" />
      </button>
    </>
  );
}
