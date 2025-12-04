import React, { useState, useEffect } from "react";
import { Bell, User, Settings, LogOut, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../services/notificationService.jsx";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../config";
const SOCKET_URL = BASE_URL;

function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Create socket connection
  useEffect(() => {
    if (!user?.userId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    // Register userId with backend
    socket.on("connect", () => {
      socket.emit("register", user.userId);
    });

    // Listen for notifications
    socket.on("notification", (data) => {
      console.log("📩 New notification:", data);
      toast.success("You have a new notification!");
      setUnreadCount((prev) => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnread = async () => {
      if (user?.userId) {
        try {
          const response = await getNotifications(user.userId);
          const notifications = response || [];
          const unread = notifications.filter(
            (n) => n.status === "UNREAD"
          ).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      }
    };
    fetchUnread();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goTo = (path) => {
    if (user?.role === "Tenant") navigate(`/tenant${path}`);
    if (user?.role === "SecurityOfficer") navigate(`/security${path}`);
    else navigate(path);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <Toaster position="top-right" />

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search anything..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          className="relative h-9 w-9 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          aria-label="Notifications"
          onClick={() => {
            goTo("/notifications");
            setUnreadCount(0); // reset when opened
          }}
        >
          <Bell className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <Dropdown
          trigger={
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold select-none">
              {initials}
            </div>
          }
        >
          <div className="flex flex-col space-y-1 p-3 text-gray-900 dark:text-gray-100">
            <p className="text-sm font-medium leading-none">
              {user?.fullName || "Guest User"}
            </p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
              {user?.email || "guest@example.com"}
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <button
            onClick={() => goTo("/profile")}
            type="button"
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => goTo("/settings")}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-700 dark:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

export default Header;
