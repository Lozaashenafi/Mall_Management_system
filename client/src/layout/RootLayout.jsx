import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "../components/Sidebar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TenantSidebar } from "../components/TenantSidebar";
import { SecurityOfficerSidebar } from "../components/SecurityOfficerSidebar";
function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isTenant, isSecurityOfficer } = useAuth();

  function toggleSidebar() {
    setCollapsed((prev) => !prev);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen bg-background flex overflow-hidden">
        {isTenant ? (
          <TenantSidebar collapsed={collapsed} onToggle={toggleSidebar} />
        ) : isSecurityOfficer ? (
          <SecurityOfficerSidebar
            collapsed={collapsed}
            onToggle={toggleSidebar}
          />
        ) : (
          <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        )}

        {/* Main Content Wrapper (Header + Main Area) */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main
            className={
              "flex-1 p-6 transition-all duration-300 bg-gray-50 dark:bg-gray-900 overflow-y-auto"
            }
          >
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default RootLayout;
