import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthorized(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // ✅ ตรวจสอบหมดอายุ (JWT exp เป็นวินาที)
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.warn('⚠️ Token expired, clearing...');
          localStorage.removeItem('token');
          setAuthorized(false);
          return;
        }

        // ✅ ตรวจสอบ role
        const role = decoded.role || (decoded.is_admin ? 'admin' : 'user');
        console.log('🔐 Current role:', role);

        // ถ้ามี allowedRoles → ต้องอยู่ในลิสต์
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          console.warn(`⛔ Unauthorized role: ${role}`);
          setAuthorized(false);
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error('❌ JWT decode failed:', err);
        localStorage.removeItem('token');
        setAuthorized(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  // ⏳ Loading UI
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        <div className="animate-pulse text-lg font-semibold">
          กำลังตรวจสอบสิทธิ์การเข้าถึง...
        </div>
      </div>
    );
  }

  // ❌ ไม่ผ่าน → redirect ไปหน้า login
  if (!authorized) return <Navigate to="/login" replace />;

  // ✅ ผ่าน → render children
  return children;
}
