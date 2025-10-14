import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login } from '../APIs/API';
import { FaUser, FaLock, FaSignInAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // ⏳ กำลังเช็ค token
  const navigate = useNavigate();

  // ✅ เช็คว่ามี token อยู่แล้วหรือไม่ (ตอนเข้าหน้า)
  useEffect(() => {
    const checkExistingToken = () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // ตรวจสอบว่า token หมดอายุหรือไม่
          if (decoded.exp && Date.now() < decoded.exp * 1000) {
            // ✅ Token ยังใช้ได้ → redirect ไป dashboard
            console.log('✅ Already logged in, redirecting...');
            navigate('/dashboard', { replace: true });
            return;
          } else {
            // ❌ Token หมดอายุ → ลบออก
            console.warn('⚠️ Token expired, removing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user_payload');
          }
        } catch (err) {
          // ❌ Token เสีย → ลบออก
          console.error('❌ Invalid token:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user_payload');
        }
      }

      setChecking(false);
    };

    checkExistingToken();
  }, [navigate]);

  // ✅ ตรวจสอบว่ามีการ logout เพราะอะไร
  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason');
    
    if (reason) {
      const alertMessages = {
        session_expired: {
          type: 'warning',
          message: '⏰ เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง'
        },
        unauthorized_role: {
          type: 'error',
          message: '⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
        },
        invalid_token: {
          type: 'error',
          message: '❌ Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
        }
      };

      const alertData = alertMessages[reason];
      if (alertData) {
        setAlert(alertData);
        
        // ซ่อนข้อความหลัง 6 วินาที
        setTimeout(() => setAlert(null), 6000);
      }

      // ลบสาเหตุออก
      sessionStorage.removeItem('logout_reason');
    }
  }, []);

  const safeDecode = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        throw new Error('Token expired');
      }
      return decoded || {};
    } catch (e) {
      console.error('JWT decode error:', e);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setAlert(null);
    setLoading(true);

    try {
      const { data } = await login(form);
      const { token } = data || {};

      if (!token) {
        throw new Error('ไม่พบโทเค็นจากเซิร์ฟเวอร์');
      }

      // ✅ decode และตรวจสอบ
      const payload = safeDecode(token);
      if (!payload) {
        throw new Error('โทเค็นไม่ถูกต้อง หรือหมดอายุ');
      }

      const role = payload.role || (payload.is_admin ? 'admin' : 'user');
      const isAdmin = !!payload.is_admin;
      const isRoleAdmin = role === 'admin' || role === 'm_admin';

      // ✅ เก็บเฉพาะ token
      localStorage.setItem('token', token);

      // ✅ นำทางตามสิทธิ์
      if (isRoleAdmin || isAdmin) {
        navigate('/dashboard', { replace: true });
      } else {
        // ลบ token ออก
        localStorage.removeItem('token');
        setMessage('คุณไม่มีสิทธิ์เข้าถึงระบบนี้ กรุณาติดต่อผู้ดูแลระบบ');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ กำลังเช็ค token
  if (checking) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-semibold">
            กำลังตรวจสอบ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="absolute inset-0 bg-pattern-light opacity-10"></div>

      <div className="relative bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <FaSignInAlt className="text-blue-600 text-5xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2">จัดการบัญชีของคุณอย่างง่ายดาย</p>
        </div>

        {/* ✅ แสดงข้อความแจ้งเตือนจากการ logout */}
        {alert && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            alert.type === 'warning' 
              ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-xl flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="ชื่อผู้ใช้งาน"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {/* ✅ แสดง error จากการ login */}
          {message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm text-center font-medium">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          หากมีปัญหาในการเข้าสู่ระบบ?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            ติดต่อผู้ดูแลระบบ
          </a>
        </div>
      </div>
    </div>
  );
}