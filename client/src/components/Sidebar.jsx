import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Home,
  Puzzle,
  DollarSign,
  Wrench,
  FileText,
  Bell,
  Settings,
  Receipt,
  History,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Lightbulb,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Grouped menu structure
  const groupedItems = [
    {
      title: "Overview",
      icon: BarChart3,
      items: [
        { title: "Dashboard", icon: LayoutDashboard, url: "/" },
        { title: "Reports", icon: FileText, url: "/reports" },
      ],
    },
    {
      title: "Room Management",
      icon: Home,
      items: [
        { title: "Rooms", icon: Building2, url: "/manage-rooms" },
        { title: "Room Features", icon: Puzzle, url: "/manage-roomfeature" },
      ],
    },
    {
      title: "Operations",
      icon: ClipboardList,
      items: [
        { title: "Rentals", icon: Receipt, url: "/manage-rentals" },

        { title: "Payments", icon: DollarSign, url: "/payments" },
        { title: "Banks", icon: DollarSign, url: "/manage-bank" },

        { title: "Maintenance", icon: Wrench, url: "/maintenance" },
        { title: "Expenses", icon: FileText, url: "/expenses" },
        { title: "Utilities", icon: Lightbulb, url: "/utilities" },
        { title: "Tenants", icon: Users, url: "/manage-tenants" }, // ✅ added here
        { title: "Terminate Requests", icon: Power, url: "/terminate" },
      ],
    },
    {
      title: "Users & Settings",
      icon: Users,
      items: [
        ...(user?.role === "SuperAdmin"
          ? [{ title: "Users", icon: Users, url: "/manage-users" }]
          : []),
        { title: "Logs", icon: History, url: "/logs" },
        { title: "Notifications", icon: Bell, url: "/notifications" },
        { title: "Settings", icon: Settings, url: "/settings" },
      ],
    },
  ];

  const SidebarContent = (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 dark:bg-gray-900 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between dark:border-gray-700">
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
        {groupedItems.map((group) => {
          const isOpen = openDropdown === group.title;

          return (
            <div key={group.title}>
              <button
                onClick={() => setOpenDropdown(isOpen ? null : group.title)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  text-gray-700 hover:text-purple-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white`}
              >
                <div className="flex items-center">
                  <group.icon className="w-5 h-5 mr-3" />
                  {!collapsed && <span>{group.title}</span>}
                </div>
                {!collapsed &&
                  (isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </button>

              {/* Dropdown content */}
              {isOpen && !collapsed && (
                <div className="pl-10 space-y-1 mt-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-2 py-2 rounded-md text-sm transition-all duration-200
                          ${
                            isActive
                              ? "bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-white"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.title}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
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
