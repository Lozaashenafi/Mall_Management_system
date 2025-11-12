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
  Menu, // Using Menu icon for mobile toggle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  // Using a cleaner name for mobile open state for clarity
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState("Overview"); // Defaulting to 'Overview' open

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Grouped menu structure (kept the same as requested)
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
        { title: "Tenants", icon: Users, url: "/manage-tenants" },
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
    // Increased width, used shadow, and deeper colors for dark mode
    <div
      className={`h-full ${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-xl dark:bg-gray-800 dark:border-gray-700`}
    >
      {/* Header - Cleaner Branding */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between dark:border-gray-700/50">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
              MallManager
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center shadow-md mx-auto">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsMobileOpen(false);
            } else {
              onToggle();
            }
          }}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation - Enhanced Layout */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {groupedItems.map((group) => {
          const isOpen = openDropdown === group.title;
          // Check if any item in the group is active for highlighting the whole group header
          const isGroupActive = group.items.some(
            (item) => location.pathname === item.url
          );

          return (
            <div key={group.title}>
              <button
                onClick={() => setOpenDropdown(isOpen ? null : group.title)}
                className={`w-full flex items-center justify-between ${
                  collapsed ? "p-3 mx-auto" : "px-3 py-2"
                } rounded-lg text-sm font-semibold transition-all duration-200 group
                  ${
                    isGroupActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"
                  } hover:bg-gray-50 dark:hover:bg-gray-700/70`}
                // Added a title attribute for better UX in collapsed state (acts as a simple tooltip)
                title={group.title}
              >
                <div className="flex items-center">
                  <group.icon
                    className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`}
                  />
                  {!collapsed && (
                    <span className="truncate">{group.title}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white" />
                    )}
                  </div>
                )}
              </button>

              {/* Dropdown content */}
              {isOpen && !collapsed && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-gray-200 dark:border-gray-700 ml-5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300" // Polished active state
                              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                      >
                        <item.icon className="w-4 h-4 mr-3 opacity-80" />
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

      {/* Footer with User Info - Elevated Look */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {!collapsed && user && (
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 transition-shadow duration-300 hover:shadow-lg cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
              {/* Added a fallback for better handling */}
              {user.fullName
                ? user.fullName
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.fullName || "Unnamed User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            {/* Added a subtle settings icon for profile link (implied) */}
            <Settings className="w-4 h-4 text-gray-400 hover:text-indigo-600 dark:hover:text-white flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Absolute positioning removed for standard layout flow */}
      <div
        className={`hidden md:block flex-shrink-0 ${
          collapsed ? "w-20" : "w-64"
        } transition-all duration-300`}
      >
        {SidebarContent}
      </div>

      {/* Mobile Sidebar - Full screen overlay with slide animation (implied by classes) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop for click-to-close */}
          <div
            className="bg-black/40 flex-1 transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Mobile content - positioned to slide in */}
          <div className="absolute top-0 left-0 bottom-0 z-50 transform translate-x-0 transition-transform duration-300">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Toggle Button - Moved to a top-left/corner position for typical mobile app UX */}
      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-indigo-600 text-white p-2.5 rounded-lg shadow-xl transition-all duration-200 hover:bg-indigo-700"
          onClick={() => setIsMobileOpen(true)}
        >
          {/* Using the Menu icon for the collapsed state for a more standard mobile look */}
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
