import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GetUsers } from '../APIs/API';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaUserFriends, FaUserCheck, FaUserSlash, FaSyncAlt, FaArrowRight, FaCog, FaPlus, FaCheck } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const usersRes = await GetUsers(token).catch(() => ({ data: [] }));
      const allUsers = usersRes?.data ? Object.values(usersRes.data).flat() : [];
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = users.length;
  const verified = users.filter((u) => u.is_verified).length;
  const unverified = users.filter((u) => !u.is_verified).length;

  const filteredUsers = useMemo(() => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;

    return users.filter((u) => {
      if (verifiedFilter === 'verified' && !u.is_verified) return false;
      if (verifiedFilter === 'unverified' && u.is_verified) return false;

      if (s || e) {
        const created = u.created_at ? new Date(u.created_at) : u.birthdate ? new Date(u.birthdate) : null;
        if (!created) return false;
        if (s && created < s) return false;
        if (e && created > e) return false;
      }

      return true;
    });
  }, [users, startDate, endDate, verifiedFilter]);

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    const labels = months.map((m) => m.toLocaleString('th-TH', { month: 'long' }));
    const counts = months.map((m) => {
      const start = new Date(m.getFullYear(), m.getMonth(), 1);
      const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
      return filteredUsers.filter((u) => {
        const created = u.created_at ? new Date(u.created_at) : u.birthdate ? new Date(u.birthdate) : null;
        if (!created) return false;
        return created >= start && created <= end;
      }).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'ผู้ใช้ใหม่ (เดือน)',
          data: counts,
          borderColor: 'rgba(59,130,246,1)',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [filteredUsers]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'ผู้ใช้ใหม่ใน 6 เดือนล่าสุด', font: { size: 16, weight: 'bold' } }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: {
          stepSize: 1,
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  const recentUsers = useMemo(() => filteredUsers.slice(0, 5), [filteredUsers]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h2>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 transition-transform transform hover:scale-105">
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                <FaUserFriends className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-semibold text-gray-900">{loading ? '...' : total.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 transition-transform transform hover:scale-105">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <FaUserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ยืนยันแล้ว</p>
                <p className="text-3xl font-semibold text-gray-900">{loading ? '...' : verified.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 transition-transform transform hover:scale-105">
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <FaUserSlash className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ยังไม่ยืนยัน</p>
                <p className="text-3xl font-semibold text-gray-900">{loading ? '...' : unverified.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                <label className="text-sm text-gray-600">ช่วงเวลา:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
                <span className="text-gray-500 hidden sm:inline">ถึง</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="verified">ยืนยันแล้ว</option>
                  <option value="unverified">ยังไม่ยืนยัน</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => { setRefreshing(true); fetchData(); }}
                  disabled={refreshing}
                  className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200
                    ${refreshing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
                </button>
                <div className="text-sm text-gray-600">
                  {loading ? 'กำลังโหลด...' : `พบ ${filteredUsers.length.toLocaleString()} รายการ`}
                </div>
              </div>
            </div>

            <div className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  กำลังโหลดกราฟ...
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent users */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">ผู้ใช้ล่าสุด</h3>
                <Link to="/users" className="text-sm text-blue-600 hover:underline flex items-center">
                  ดูรายการทั้งหมด <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
              {loading ? (
                <div className="p-6 text-center text-gray-600">กำลังโหลด...</div>
              ) : recentUsers.length === 0 ? (
                <div className="p-6 text-gray-500 text-center">ยังไม่มีผู้ใช้</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentUsers.map((u, i) => (
                    <li key={u.id || i} className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                          {u.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.display_name || 'ไม่ระบุ'}</div>
                          <div className="text-sm text-gray-500">{u.email || (u.phone ? u.phone : 'ไม่ระบุ')}</div>
                        </div>
                      </div>

                      <div>
                        {u.is_verified ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaUserCheck className="inline mr-1" /> ยืนยันแล้ว
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FaUserSlash className="inline mr-1" /> ยังไม่ยืนยัน
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick actions</h3>
              <div className="flex flex-col space-y-4 flex-1">
                <Link to="/users" className="group flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
                  <FaCog className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  จัดการผู้ใช้
                </Link>
                <Link to="/pending-admin" className="group flex items-center justify-center py-3 px-4 bg-yellow-500 text-white rounded-xl shadow-md transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg">
                  <FaSyncAlt className="mr-2 group-hover:animate-pulse" />
                  ผู้ดูแลรออนุมัติ
                </Link>
                <Link to="/add-admin" className="group flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-xl shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg">
                  <FaPlus className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                  เพิ่มผู้ดูแล
                </Link>
                <Link to="/approve" className="group flex items-center justify-center py-3 px-4 bg-gray-700 text-white rounded-xl shadow-md transition-all duration-200 hover:bg-gray-800 hover:shadow-lg">
                  <FaCheck className="mr-2" />
                  อนุมัติ
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-500 text-center">
                คำเตือน: บางลิงก์อาจจำกัดสิทธิ์ตามบทบาทผู้ใช้
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;