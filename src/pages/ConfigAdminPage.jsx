import { useState } from 'react';
import { configAdmin } from '../APIs/API';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ConfigAdminPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await configAdmin(form, token); // API response
    setMessage(res.message); // เช่น "Admin created (not verified)"
    window.location.href = '/login';
  } catch (err) {
    // ดึงข้อความจาก API เช่น "มีแล้ว"
    const errorMessage = err.response?.data?.message || 'Failed to add admin';
    setMessage(errorMessage);
  }
};


  return (
    

    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center text-red-600">Config ADD Admin</h2>
        <input
          type="username"
          placeholder="username"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {message && <p className="text-green-600">{message}</p>}
        <button type="submit" className="bg-green-600 text-white w-full p-2 rounded">
          ADD ADDMIN
        </button><br /><br />
        <a href="/login" className='text-blue-500'>Back to login</a>
      </form>

    </div>
    </div>
  );
}
