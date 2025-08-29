import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { GetUsers } from '../APIs/API';
import Navbar from '../components/Navbar';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    GetUsers(token)
      .then((res) => {
        const allUsers = Object.values(res.data).flat();
        setUsers(allUsers);
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = filterText.toLowerCase();
    return (
      user.display_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search)
    );
  });

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'ชื่อ',
      selector: (row) => row.display_name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'โทร',
      selector: (row) => row.phone,
    },
    {
      name: 'เพศ',
      selector: (row) =>
        row.gender === 0 ? 'ชาย' : row.gender === 1 ? 'หญิง' : 'ไม่ระบุ',
    },
    {
      name: 'วันเกิด',
      selector: (row) => row.birthdate,
    },
    {
      name: 'Provider',
      selector: (row) => row.providers || 'unknown',
    },
    {
      name: 'ยืนยัน',
      cell: (row) => (row.is_verified ? '✅' : '❌'),
      center: true,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">📋 รายชื่อผู้ใช้</h1>
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อ / อีเมล / เบอร์"
            className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          responsive
          striped
          paginationPerPage={30}
          paginationRowsPerPageOptions={[10, 30, 50, 100]}
          noDataComponent="ไม่พบข้อมูลผู้ใช้"
        />
      </div>
    </>
  );
}
