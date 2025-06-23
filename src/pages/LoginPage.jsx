import { useState } from 'react';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // ✅ FIXED: ใช้ named import

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🔴 คุณลืมเรียก login(form)
      const res = await login(form);
      const { token } = res.data;

      localStorage.setItem('token', token); // 🔑 เก็บ token ไว้ใช้ต่อ

      const decoded = jwtDecode(token);
      const usernameFromToken = decoded.username;

      // ✅ ตรวจชื่อแล้วไปตามสิทธิ
      if (usernameFromToken === 'H_ADMIN') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
        setMessage('ยังไม่สามารถเข้าสู่ระบบได้');

      }
    } catch (err) {
      setError('Login failed');
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
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Login
        </button><br /><br />

      </form>
    </div>
  );
}
