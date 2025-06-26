import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { GetUsers } from '../services/api';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [resData, setResData] = useState({});
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    GetUsers(token)
      .then((res) => {
        console.log('API response:', res.data);
        const allUsers = Object.values(res.data).flat(); // รวมทุกหมวดเป็น array เดียว
        setUsers(allUsers);
        setResData(res.data); // เก็บไว้ใช้ filter ทีหลัง
        setProviders(Object.keys(res.data)); // ['google', 'manual', 'unknown']
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const filteredUsers =
    selectedProvider === 'all'
      ? users
      : resData[selectedProvider] || [];

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">รายชื่อผู้ใช้</h1>
          <select
            className="border border-gray-300 rounded px-4 py-2 text-gray-700 shadow-sm"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2 border">No.</th>
                <th className="px-4 py-2 border">ชื่อ</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">โทร</th>
                <th className="px-4 py-2 border">เพศ</th>
                <th className="px-4 py-2 border">วันเกิด</th>
                <th className="px-4 py-2 border">Provider</th>
                <th className="px-4 py-2 border text-center">ยืนยัน</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.user_id} className="text-sm text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{user.display_name}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.phone}</td>
                    <td className="px-4 py-2 border">
                      {user.gender === 1
                        ? 'ชาย'
                        : user.gender === 2
                        ? 'หญิง'
                        : 'ไม่ระบุ'}
                    </td>
                    <td className="px-4 py-2 border">{user.birthdate}</td>
                    <td className="px-4 py-2 border">{user.providers || 'unknown'}</td>
                    <td className="px-4 py-2 border text-center">
                      {user.is_verified ? '✅' : '❌'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
