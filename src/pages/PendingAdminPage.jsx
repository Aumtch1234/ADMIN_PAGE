import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getVerifyList, verifyAdmin } from '../APIs/API';
import Navbar from '../components/Navbar';
import { Shield, UserCheck, Users, AlertCircle, CheckCircle, Clock, ChevronDown, Search, X, Filter } from 'lucide-react';

export default function PendingAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedVerify, setSelectedVerify] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode(token);
    setUsername(decoded.username);
    setRole(decoded.role);

    getVerifyList(token)
      .then((res) => {
        setAdmins(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching pending admins:', err);
        setIsLoading(false);
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
    setIsProcessing(true);

    const updates = admins.filter((admin) =>
      selectedRoles[admin.id] !== undefined
    );

    try {
      for (const admin of updates) {
        const id = admin.id;
        const chosenRole = selectedRoles[id] ?? admin.role;

        const res = await verifyAdmin(id, token, chosenRole);

        // ✅ ถ้ามีข้อความแจ้งเตือนจาก backend ให้โยนเป็น error ออกมาเลย
        if (res.data && res.data.message && res.status !== 200) {
          throw new Error(res.data.message);
        }
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
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setIsProcessing(false);

      // ✅ ดึงข้อความจาก backend ถ้ามี
      const errorMsg =
        err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดระหว่างการยืนยัน';

      // ✅ ใช้ alert หรือ popup สวย ๆ ก็ได้ เช่น toast หรือ sweetalert2
      alert(errorMsg);
    }
  };


  const getRoleBadge = (roleType) => {
    const badges = {
      'm_admin': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Master Admin' },
      'admin': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Admin' },
      'user': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'User' }
    };
    return badges[roleType] || badges['user'];
  };

  const hasChanges = Object.keys(selectedRoles).length > 0;

  // Filter admins based on search query and role filter
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.username.toLowerCase().includes(searchQuery.toLowerCase());
    const currentRole = selectedRoles[admin.id] ?? admin.role;
    const matchesRole = filterRole === 'all' || currentRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const clearSearch = () => {
    setSearchQuery('');
    setFilterRole('all');
  };

  // ✅ สรุปจำนวนสถานะแต่ละประเภท
  const totalMaster = admins.filter(a => a.role === 'm_admin').length;
  const totalAdmin = admins.filter(a => a.role === 'admin').length;
  const totalUser = admins.filter(a => a.role === 'user').length;
  const totalSelected = Object.keys(selectedRoles).length; // จำนวนที่เลือกแล้ว


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Verification Dashboard
                  </h1>
                  <p className="text-gray-500 mt-1">จัดการและยืนยันสิทธิ์ผู้ดูแลระบบ</p>
                </div>
              </div>
            </div>
            {/* ✅ Stats กล่องสรุปใต้ Header */}
            <div className="flex flex-wrap justify-center items-stretch gap-6 mt-8 mb-4">
              {/* Master Admin */}
              <div className="flex flex-col items-center justify-center bg-purple-50 w-48 px-6 py-5 rounded-xl shadow-sm border border-purple-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-700">{totalMaster}</span>
                </div>
                <p className="text-sm text-purple-600 font-medium">Master Admin</p>
              </div>

              {/* Admin */}
              <div className="flex flex-col items-center justify-center bg-blue-50 w-48 px-6 py-5 rounded-xl shadow-sm border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-700">{totalAdmin}</span>
                </div>
                <p className="text-sm text-blue-600 font-medium">Admin</p>
              </div>

              {/* User */}
              <div className="flex flex-col items-center justify-center bg-gray-50 w-48 px-6 py-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-700">{totalUser}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">User</p>
              </div>

              {/* ✅ เลือกแล้ว */}
              <div className="flex flex-col items-center justify-center bg-green-50 w-48 px-6 py-5 rounded-xl shadow-sm border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">{totalSelected}</span>
                </div>
                <p className="text-sm text-green-600 font-medium">เลือกแล้ว</p>
              </div>
            </div>

          </div>

          {/* Search and Filter Section */}
          {admins.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อผู้ใช้..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">กรองตามบทบาท:</span>
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="m_admin">Master Admin</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || filterRole !== 'all') && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>

              {/* Search Results Info */}
              {(searchQuery || filterRole !== 'all') && (
                <div className="mt-4 text-sm text-gray-500">
                  แสดงผลลัพธ์ {filteredAdmins.length} จาก {admins.length} รายการ
                </div>
              )}
            </div>
          )}

          {/* Success Alert */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">ยืนยันสิทธิ์เรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : admins.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <UserCheck className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่มีผู้ใช้ที่รอการยืนยัน</h3>
              <p className="text-gray-500">ผู้ใช้ทั้งหมดได้รับการยืนยันสิทธิ์เรียบร้อยแล้ว</p>
            </div>
          ) : (
            /* Admin List */
            <div className="space-y-4">
              {filteredAdmins.length === 0 ? (
                /* No Results State */
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                    <Search className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบผลลัพธ์</h3>
                  <p className="text-gray-500 mb-4">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา</p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              ) : (
                filteredAdmins.map((admin, index) => {
                  const currentRole = selectedRoles[admin.id] ?? admin.role;
                  const roleBadge = getRoleBadge(currentRole);
                  const hasChanged = selectedRoles[admin.id] !== undefined;

                  return (
                    <div
                      key={admin.id}
                      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${hasChanged ? 'border-blue-300 bg-blue-50/30' : 'border-transparent'
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {admin.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {searchQuery && admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                <span>
                                  {admin.username.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                    part.toLowerCase() === searchQuery.toLowerCase() ?
                                      <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark> :
                                      part
                                  )}
                                </span>
                              ) : (
                                admin.username
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">จัดการได้เลย</span>
                              {hasChanged && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                                  มีการเปลี่ยนแปลง
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Role Selection */}
                        {role === 'm_admin' && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">บทบาท:</span>
                            <div className="relative">
                              <select
                                className={`appearance-none px-4 py-2.5 pr-10 rounded-lg border-2 font-medium transition-all cursor-pointer
                                  ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}
                                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                value={currentRole}
                                onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                              >
                                <option value="m_admin">🔑 Master Admin</option>
                                <option value="admin">👤 Admin</option>
                                <option value="user">📋 User</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Action Button */}
          {role === 'm_admin' && admins.length > 0 && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleVerifyAll}
                disabled={!hasChanges || isProcessing}
                className={`
                  relative px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg
                  ${hasChanges && !isProcessing
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      กำลังยืนยัน...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      ยืนยันการเปลี่ยนแปลง
                      {hasChanges && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {Object.keys(selectedRoles).length}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}