import { useState } from 'react';
import { addAdmin } from '../services/api';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AddAdminPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAdmin(form, token);
      setMessage('Admin added successfully');
      window.location.href = '/pending-admin'//Redirect to register after successful addition
    } catch {
      setMessage('Failed to add admin');
    }
  };

  return (
    

    <div className="flex flex-col h-screen">
      <Navbar/>
      <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Add Admin</h2>
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
          Add Admin
        </button>
        <a href="../" className='text-blue-500'>Back</a>
      </form>

    </div>
    </div>
  );
}
