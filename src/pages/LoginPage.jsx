import { useState } from 'react';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await login(form);
      const { token } = res.data;

      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      const { role } = decoded;

      if (role === 'admin' || role === 'm_admin') {
        navigate('/dashboard');
      } else {
        // ✅ ไม่ redirect ก่อน ให้ตั้งข้อความเตือนก่อน
        setMessage('คุณยังไม่มีสิทธิ์เข้าถึง');
      }
    } catch (err) {
      // ✅ อ่าน message จาก response API
      const msg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(msg); // ✅ ตั้ง error ที่จะแสดงใน UI
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4 text-amber-700 text-center">Login</h1>

        <input
          placeholder="username"
          className="w-full border p-2 mb-3 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="password"
          className="w-full border p-2 mb-3 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {/* ✅ แสดงข้อความผิดพลาด */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-red-600 text-sm">{message}</p>}

        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded mt-3">
          Login
        </button>
      </form>
    </div>
  );
}
