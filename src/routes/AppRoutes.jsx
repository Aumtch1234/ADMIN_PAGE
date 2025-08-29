import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AddAdminPage from '../pages/AddAdminPage';
import DashboardPage from '../pages/DashboardPage';
import PendingAdminPage from '../pages/PendingAdminPage'; // ✅ เพิ่ม
import ProtectedRoute from '../components/ProtectedRoute';
import PostfoodPage from '../pages/ConfigAdminPage';
import FoodListPage from '../pages/FoodePage';
import ConfigAdminPage from '../pages/ConfigAdminPage';
import UserListPage from '../pages/UsersVerifyPage';
import ApprovePage from '../pages/ApprovePage';

export default function AppRoutes() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
        />

        <Route
          path="/config-admin"
          element={
              <ConfigAdminPage />
          }
        />

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
          path="/foods"
          element={
            <ProtectedRoute>
              <FoodListPage />
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
