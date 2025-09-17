import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "../components/Sidebar";
import { useState } from "react";

function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);

  function toggleSidebar() {
    setCollapsed((prev) => !prev);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900"> */}
      <div className="min-h-screen bg-background flex">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Header />
          <main
            className={
              "flex-1 p-6 bg-background-alt overflow-auto transition-all duration-300 bg-gray-50 dark:bg-gray-900"
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
