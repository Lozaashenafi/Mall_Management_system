import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import RootLayout from "./layout/RootLayout";
import { Toaster } from "react-hot-toast";

// Mall Management System Pages
import Home from "./pages/Home";
import TenantManage from "./pages/TenantManage";
import RoomManage from "./pages/RoomManage";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AddTenant from "./pages/AddTenant";
import EditTenant from "./pages/EditTenant";
import AddRoom from "./pages/AddRoom";
import AddInvoice from "./pages/AddInvoice";
import AddPayment from "./pages/AddPayment";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import UserManage from "./pages/UserManage";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import RentManage from "./pages/RentManage";
import TenantLayout from "./layout/TenantLayout";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantPayment from "./pages/tenant/TenantPayment";
import TenantMaintenance from "./pages/tenant/TenantMaintenance";
import TenantNotifications from "./pages/tenant/TenantNotifications";
import TenantUtilityPage from "./pages/tenant/TenantUtilityPage";
import TenantTerminateRequest from "./pages/tenant/TenantTerminateRequest";
import RoomFeatureTypeManage from "./pages/RoomFeatureTypeManage";
import RoomDetails from "./pages/RoomDetails";
import RentDetail from "./pages/RentDetail";
import TenantRentals from "./pages/tenant/TenantRentals";
import AdminTerminateRequests from "./pages/AdminTerminateRequests ";
import SocketTest from "./SocketTest";
import RentRenewal from "./pages/RentRenewal";
import UtiliySummary from "./pages/UtilitySummary";
import AddUtilityPayment from "./pages/AddUtilityPayment";
import AddPaymentRequest from "./pages/tenant/AddPaymentRequest";
import AddFloorPrice from "./pages/addFloorPrice";
import BankManage from "./pages/BankManage";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ThemeProvider attribute="class">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute adminOnly>
                <RootLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/manage-users" element={<UserManage />} />
            <Route path="/manage-tenants" element={<TenantManage />} />
            <Route path="/manage-bank" element={<BankManage />} />

            <Route path="/add-tenant" element={<AddTenant />} />
            <Route path="/edit-tenant/:id" element={<EditTenant />} />
            <Route path="/manage-rooms" element={<RoomManage />} />
            <Route path="/floor-price" element={<AddFloorPrice />} />

            <Route path="/manage-rooms/add" element={<AddRoom />} />
            <Route path="/utilities" element={<UtiliySummary />} />
            <Route
              path="/add-utility-payment/:id"
              element={<AddUtilityPayment />}
            />

            <Route path="/room-detail/:id" element={<RoomDetails />} />
            <Route path="/rent-detail/:id" element={<RentDetail />} />
            <Route path="/rent-renewal/:id" element={<RentRenewal />} />
            <Route
              path="/manage-roomfeature"
              element={<RoomFeatureTypeManage />}
            />
            <Route path="/manage-rentals" element={<RentManage />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/add/:id" element={<AddPayment />} />
            <Route path="/payments/invoice" element={<AddInvoice />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/logs" element={<AuditLogs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/terminate" element={<AdminTerminateRequests />} />
            <Route path="/test" element={<SocketTest />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/tenant"
            element={
              <PrivateRoute tenantOnly>
                <TenantLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<TenantDashboard />} />

            {/* Shared profile pages */}
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="settings" element={<Settings />} />
            <Route path="myrentals" element={<TenantRentals />} />

            {/* Tenant-specific pages */}
            <Route path="payments" element={<TenantPayment />} />
            <Route path="invoice" element={<TenantUtilityPage />} />
            <Route path="maintenance" element={<TenantMaintenance />} />
            <Route path="notifications" element={<TenantNotifications />} />
            <Route path="request/:type/:id" element={<AddPaymentRequest />} />

            <Route
              path="terminate-request"
              element={<TenantTerminateRequest />}
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
