import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AddAdminPage from '../pages/AddAdminPage';
import DashboardPage from '../pages/DashboardPage';
import PendingAdminPage from '../pages/PendingAdminPage';
import ProtectedRoute from '../components/ProtectedRoute';
import StoreListPage from '../pages/admin_markets/StoreListPage';
import ConfigAdminPage from '../pages/ConfigAdminPage';
import UserListPage from '../pages/UsersVerifyPage';
import ApprovePage from '../pages/ApprovePage';
import ManageRider from '../pages/ManageRier/ManageRider';
import RiderDetails from '../pages/ManageRier/RiderDetails';
import AddMarketPage from '../pages/admin_markets/AddMarketPage';
import AddCategoryPage from '../pages/admin_markets/AddCategory';
import StoreDetailPage from '../pages/admin_markets/StoreDetailPage';
import TopUpApprovePage from '../pages/topup-approvePage';
import ComplaintsPage from "../pages/ComplaintsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/config-admin" element={<ConfigAdminPage />} />

        <Route
          path="/add-admin"
          element={
            <ProtectedRoute allowedRoles={['m_admin']}>
              <AddAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pending-admin"
          element={
            <ProtectedRoute allowedRoles={['m_admin']}>
              <PendingAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets"
          element={
            <ProtectedRoute>
              <StoreListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-category"
          element={
            <ProtectedRoute>
              <AddCategoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-market"
          element={
            <ProtectedRoute>
              <AddMarketPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/store/:marketId"
          element={
            <ProtectedRoute>
              <StoreDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <UserListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approve"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <ApprovePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/topup-approve"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <TopUpApprovePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/riders"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <ManageRider />
            </ProtectedRoute>
          }
        />

        <Route
          path="/riders/:riderId"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <RiderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute allowedRoles={['m_admin', 'admin']}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
