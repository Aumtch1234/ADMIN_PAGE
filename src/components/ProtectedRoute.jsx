import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [authState, setAuthState] = useState({ loading: true, authorized: false, reason: null });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');

      // ❌ ไม่มี token
      if (!token) {
        setAuthState({ loading: false, authorized: false, reason: 'no_token' });
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // ❌ Token หมดอายุ
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.warn('⚠️ Token expired');
          
          // ลบข้อมูลทั้งหมด
          localStorage.removeItem('token');
          localStorage.removeItem('user_payload');
          
          // บันทึกสาเหตุ
          sessionStorage.setItem('logout_reason', 'session_expired');
          
          setAuthState({ loading: false, authorized: false, reason: 'session_expired' });
          return;
        }

        // ✅ ดึง role จาก token
        const role = decoded.role || (decoded.is_admin ? 'admin' : 'user');
        const isRoleAdmin = role === 'admin' || role === 'm_admin';

        // ❌ ตรวจสอบ role ที่อนุญาต
        if (allowedRoles.length > 0) {
          const hasAccess = allowedRoles.includes(role) || 
                           (allowedRoles.includes('admin') && isRoleAdmin);

          if (!hasAccess) {
            console.warn(`⛔ Unauthorized role: ${role}`);
            sessionStorage.setItem('logout_reason', 'unauthorized_role');
            setAuthState({ loading: false, authorized: false, reason: 'unauthorized_role' });
            return;
          }
        }

        // ✅ ผ่านทุกเงื่อนไข
        setAuthState({ loading: false, authorized: true, reason: null });

      } catch (err) {
        console.error('❌ JWT decode failed:', err);
        
        // ลบ token ที่เสีย
        localStorage.removeItem('token');
        localStorage.removeItem('user_payload');
        
        sessionStorage.setItem('logout_reason', 'invalid_token');
        setAuthState({ loading: false, authorized: false, reason: 'invalid_token' });
      }
    };

    checkAuth();
  }, [allowedRoles]);

  // ⏳ Loading
  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-semibold">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  // ❌ ไม่ผ่าน → redirect ไปหน้า login
  if (!authState.authorized) {
    return <Navigate to="/login" replace />;
  }

  // ✅ ผ่าน → render children
  return children;
}