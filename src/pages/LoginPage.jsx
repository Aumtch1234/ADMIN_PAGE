import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login } from '../APIs/API'; // ตรวจเส้นทางให้ตรงโปรเจ็กต์
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ helper ปลอดภัย: decode แล้วกัน error + ตรวจ exp
  const safeDecode = (token) => {
    try {
      const decoded = jwtDecode(token);
      // exp เป็นวินาที (Unix time)
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
    setLoading(true);

    try {
      const { data } = await login(form);
      const { token } = data || {};

      if (!token) {
        throw new Error('ไม่พบโทเค็นจากเซิร์ฟเวอร์');
      }

      // ✅ decode payload
      const payload = safeDecode(token);
      if (!payload) {
        throw new Error('โทเค็นไม่ถูกต้อง หรือหมดอายุ');
      }

      // ตัวอย่างคีย์ที่คาดหวังใน payload: role, is_admin, admin_id, userId/email ฯลฯ
      const role = payload.role || (payload.is_admin ? 'admin' : 'user');
      const isAdmin = !!payload.is_admin;
      const adminId = payload.admin_id ?? payload.userId ?? payload.id;

      // ✅ เก็บ token + payload ไว้ใช้งาน
      localStorage.setItem('token', token);
      localStorage.setItem('user_payload', JSON.stringify({
        role,
        is_admin: isAdmin,
        admin_id: adminId,
        email: payload.email,
        username: payload.username,
        iat: payload.iat,
        exp: payload.exp,
      }));

      // ✅ นำทางตามสิทธิ์ (รองรับทั้ง role และ is_admin)
      const isRoleAdmin = role === 'admin' || role === 'm_admin';
      if (isRoleAdmin || isAdmin) {
        // ไปแดชบอร์ด/เพจแอดมินที่ต้องการ
        navigate('/dashboard'); // หรือ '/admin/stores'
      } else {
        setMessage('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

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

          {message && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md text-center border border-red-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60"
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
