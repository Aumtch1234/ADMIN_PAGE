import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getVerifyList, verifyAdmin } from '../APIs/API';
import Navbar from '../components/Navbar';

export default function PendingAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedVerify, setSelectedVerify] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode(token);
    setUsername(decoded.username);
    setRole(decoded.role);

    getVerifyList(token)
      .then((res) => setAdmins(res.data))
      .catch((err) => {
        console.error('Error fetching pending admins:', err);
      });
  }, []);

  const handleRoleChange = (adminId, newRole) => {
    setSelectedRoles((prev) => ({ ...prev, [adminId]: newRole }));

    if (newRole === 'user') {
      setSelectedVerify((prev) => ({ ...prev, [adminId]: false }));
    }
    if (newRole === 'admin') {
      setSelectedVerify((prev) => ({ ...prev, [adminId]: true }));
    }
  };

  const handleVerifyChange = (adminId, newStatus) => {
    setSelectedVerify((prev) => ({ ...prev, [adminId]: newStatus === 'true' }));
  };

  const handleVerifyAll = async () => {
    const token = localStorage.getItem('token');

    const updates = admins.filter((admin) =>
      selectedRoles[admin.id] !== undefined
    );

    try {
      for (const admin of updates) {
        const id = admin.id;
        const chosenRole = selectedRoles[id] ?? admin.role;

        await verifyAdmin(id, token, chosenRole);
      }

      setAdmins((prev) =>
        prev.map((admin) => {
          const id = admin.id;
          if (selectedRoles[id] !== undefined) {
            return {
              ...admin,
              role: selectedRoles[id],
            };
          }
          return admin;
        })
      );

      setSelectedRoles({});
      alert('ยืนยันเรียบร้อยแล้ว');
    } catch (err) {
      alert('เกิดข้อผิดพลาดระหว่างการยืนยัน');
    }
  };


  return (
    <>
      <Navbar />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-700 mb-4">Admin Verification Dashboard</h1>

        {admins.length === 0 ? (
          <p className="text-gray-600">No unverified admins</p>
        ) : (
          <ul className="space-y-4">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="bg-white shadow p-4 rounded flex flex-col gap-3 md:flex-row md:justify-between md:items-center"
              >
                <span className="font-medium">{admin.username}</span>

                {role === 'm_admin' && (
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      className="border rounded px-3 py-1"
                      value={selectedRoles[admin.id] ?? admin.role}
                      onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                    >
                      <option value="m_admin">Master Admin</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>

                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* ปุ่มยืนยันทั้งหมด */}
        {role === 'm_admin' && admins.length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={handleVerifyAll}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
            >
              ✅ ยืนยันทั้งหมด
            </button>
          </div>
        )}
      </div>
    </>
  );
}
