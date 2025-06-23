import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AddAdminPage from '../pages/AddAdminPage';
import DashboardPage from '../pages/DashboardPage';
import PendingAdminPage from '../pages/PendingAdminPage'; // ✅ เพิ่ม
import ProtectedRoute from '../components/ProtectedRoute';
import PostfoodPage from '../pages/PostfoodPage';
import FoodListPage from '../pages/FoodePage';

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
          path="/postfood"
          element={
            <ProtectedRoute>
              <PostfoodPage />
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
