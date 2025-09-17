import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import RootLayout from "./layout/RootLayout";

// Mall Management System Pages
import Home from "./pages/Home";
import TenantManage from "./pages/TenantManage";
import RoomManage from "./pages/RoomManage";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import Statistics from "./pages/Statistics";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AddTenant from "./pages/AddTenant";
import AddRoom from "./pages/AddRoom";
import AddInvoice from "./pages/AddInvoice";
import AddPayment from "./pages/AddPayment";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import UserManage from "./pages/UserManage";

function App() {
  return (
    <>
      <ThemeProvider attribute="class">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RootLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/manage-users" element={<UserManage />} />
            <Route path="/manage-tenants" element={<TenantManage />} />

            <Route path="/manage-tenants/add" element={<AddTenant />} />
            <Route path="/manage-rooms" element={<RoomManage />} />
            <Route path="/manage-rooms/add" element={<AddRoom />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/add" element={<AddPayment />} />
            <Route path="/payments/invoice" element={<AddInvoice />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/logs" element={<AuditLogs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
