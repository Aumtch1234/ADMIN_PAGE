import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { GetUsers } from "../APIs/API";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  FaUserFriends,
  FaUserCheck,
  FaUserSlash,
  FaSyncAlt,
  FaArrowRight,
  FaCog,
  FaPlus,
  FaCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import axios from "axios";
import API from "../APIs/midleware";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [gpSummary, setGpSummary] = useState({ today: 0, week: 0, month: 0, year: 0 });
  const [gpLoading, setGpLoading] = useState(true);

  // ✅ ดึงข้อมูล GP รวมและสรุปจาก API
  const fetchGpSummary = async () => {
    try {
      const [today, week, month, year] = await Promise.all([
        axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/today`),
        axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/week`),
        axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/month`),
        axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/year`),
      ]);
      setGpSummary({
        today: today.data.data.total_gp,
        week: week.data.data.total_gp,
        month: month.data.data.total_gp,
        year: year.data.data.total_gp,
      });
    } catch (err) {
      console.error("Failed to fetch GP summary", err);
    } finally {
      setGpLoading(false);
    }
  };

  // ✅ ดึงข้อมูลผู้ใช้
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const usersRes = await GetUsers(token).catch(() => ({ data: [] }));
      const allUsers = usersRes?.data ? Object.values(usersRes.data).flat() : [];
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGpSummary();
  }, []);

  const total = users.length;
  const verified = users.filter((u) => u.is_verified).length;
  const unverified = users.filter((u) => !u.is_verified).length;

  // ✅ ฟิลเตอร์ผู้ใช้
  const filteredUsers = useMemo(() => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;

    return users.filter((u) => {
      if (verifiedFilter === "verified" && !u.is_verified) return false;
      if (verifiedFilter === "unverified" && u.is_verified) return false;

      if (s || e) {
        const created = u.created_at
          ? new Date(u.created_at)
          : u.birthdate
          ? new Date(u.birthdate)
          : null;
        if (!created) return false;
        if (s && created < s) return false;
        if (e && created > e) return false;
      }

      return true;
    });
  }, [users, startDate, endDate, verifiedFilter]);

  // ✅ กราฟจำนวนผู้ใช้ (คงเดิม)
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    const labels = months.map((m) => m.toLocaleString("th-TH", { month: "long" }));
    const counts = months.map((m) => {
      const start = new Date(m.getFullYear(), m.getMonth(), 1);
      const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
      return filteredUsers.filter((u) => {
        const created = u.created_at
          ? new Date(u.created_at)
          : u.birthdate
          ? new Date(u.birthdate)
          : null;
        if (!created) return false;
        return created >= start && created <= end;
      }).length;
    });

    return {
      labels,
      datasets: [
        {
          label: "ผู้ใช้ใหม่ (เดือน)",
          data: counts,
          backgroundColor: "rgba(59,130,246,0.6)",
          borderRadius: 6,
        },
      ],
    };
  }, [filteredUsers]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "ผู้ใช้ใหม่ใน 6 เดือนล่าสุด",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const recentUsers = useMemo(() => filteredUsers.slice(0, 5), [filteredUsers]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h2>

          {/* ✅ Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard icon={<FaUserFriends />} color="indigo" label="ผู้ใช้ทั้งหมด" value={total} />
            <SummaryCard icon={<FaUserCheck />} color="green" label="ยืนยันแล้ว" value={verified} />
            <SummaryCard icon={<FaUserSlash />} color="red" label="ยังไม่ยืนยัน" value={unverified} />
            <SummaryCard
              icon={<FaMoneyBillWave />}
              color="yellow"
              label="รายได้ GP รวม"
              value={gpSummary.year}
              suffix="฿"
            />
          </div>

          {/* ✅ กราฟผู้ใช้ */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-500">กำลังโหลดกราฟ...</div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* ✅ กราฟ GP ระบบ (3 แท็บใน 1 การ์ด) */}
          <GpChartsCard gpSummary={gpSummary} loading={gpLoading} />

          {/* ✅ ผู้ใช้ล่าสุด & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentUsers users={recentUsers} loading={loading} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== กราฟ GP ระบบ ===================== */
function GpChartsCard({ gpSummary, loading }) {
  const [activeTab, setActiveTab] = useState("week");
  const [charts, setCharts] = useState({ week: null, month: null, year: null });
  const [tabLoading, setTabLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(220,220,220,0.3)" } },
      x: { grid: { display: false } },
    },
  };

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const [weekRes, monthRes, yearRes] = await Promise.all([
          axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/weekly`),
          axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/monthly`),
          axios.get(`${API.BASES.pasin}/client/categories/gp_riderrequired/yearly`),
        ]);

        setCharts({
          week: {
            labels: weekRes.data.data.labels,
            datasets: [
              {
                label: "รายได้ GP ต่อวัน",
                data: weekRes.data.data.values,
                backgroundColor: "rgba(59,130,246,0.6)",
                borderRadius: 8,
              },
            ],
          },
          month: {
            labels: monthRes.data.data.labels,
            datasets: [
              {
                label: "รายได้ GP ต่อเดือน",
                data: monthRes.data.data.values,
                backgroundColor: "rgba(34,197,94,0.6)",
                borderRadius: 8,
              },
            ],
          },
          year: {
            labels: yearRes.data.data.labels,
            datasets: [
              {
                label: "รายได้ GP ต่อปี",
                data: yearRes.data.data.values,
                backgroundColor: "rgba(234,179,8,0.6)",
                borderRadius: 8,
              },
            ],
          },
        });
      } catch (err) {
        console.error("Failed to fetch GP charts", err);
      } finally {
        setTabLoading(false);
      }
    };

    fetchCharts();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">รายได้ GP ของระบบ</h3>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">กำลังโหลด...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <StatBox label="วันนี้" value={gpSummary.today} />
            <StatBox label="สัปดาห์นี้" value={gpSummary.week} />
            <StatBox label="เดือนนี้" value={gpSummary.month} />
            <StatBox label="ปีนี้" value={gpSummary.year} />
          </div>

          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-4">
            {["week", "month", "year"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {tab === "week" ? "รายอาทิตย์" : tab === "month" ? "รายเดือน" : "รายปี"}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-80">
            {tabLoading || !charts[activeTab] ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                กำลังโหลดกราฟ...
              </div>
            ) : (
              <Bar data={charts[activeTab]} options={chartOptions} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== Components อื่นๆ ===================== */
function SummaryCard({ icon, color, label, value, suffix }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 hover:scale-105 transition-transform">
      <div className={`p-3 bg-${color}-100 rounded-full text-${color}-600`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-semibold text-gray-900">
          {value ? Number(value).toLocaleString() : "..."} {suffix || ""}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-center flex-1 min-w-[120px]">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-green-700">
        {value ? Number(value).toLocaleString() + " ฿" : "0 ฿"}
      </p>
    </div>
  );
}

function RecentUsers({ users, loading }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">ผู้ใช้ล่าสุด</h3>
        <Link to="/users" className="text-sm text-blue-600 hover:underline flex items-center">
          ดูทั้งหมด <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>
      {loading ? (
        <div className="p-6 text-center text-gray-600">กำลังโหลด...</div>
      ) : users.length === 0 ? (
        <div className="p-6 text-gray-500 text-center">ยังไม่มีผู้ใช้</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {users.map((u, i) => (
            <li key={u.id || i} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                  {u.display_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{u.display_name || "ไม่ระบุ"}</div>
                  <div className="text-sm text-gray-500">{u.email || u.phone || "ไม่ระบุ"}</div>
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
  );
}

function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="flex flex-col space-y-4">
        <Link
          to="/users"
          className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          <FaCog className="mr-2" /> จัดการผู้ใช้
        </Link>
        <Link
          to="/pending-admin"
          className="flex items-center justify-center py-3 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition"
        >
          <FaSyncAlt className="mr-2" /> ผู้ดูแลรออนุมัติ
        </Link>
        <Link
          to="/add-admin"
          className="flex items-center justify-center py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition"
        >
          <FaPlus className="mr-2" /> เพิ่มผู้ดูแล
        </Link>
        <Link
          to="/approve"
          className="flex items-center justify-center py-3 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-800 transition"
        >
          <FaCheck className="mr-2" /> อนุมัติ
        </Link>
        <Link
          to="/complaints"
          className="flex items-center justify-center py-3 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition"
        >
          <FaUserSlash className="mr-2" /> ดูคำร้องเรียน
        </Link>
              </div>
      <p className="mt-6 text-xs text-center text-gray-500">
        * บางลิงก์อาจจำกัดสิทธิ์ตามบทบาทผู้ใช้
      </p>
    </div>
  );
}

export default DashboardPage;
