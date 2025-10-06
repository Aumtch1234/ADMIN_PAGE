import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { GetUsers } from '../APIs/API';
import Navbar from '../components/Navbar';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    GetUsers(token)
      .then((res) => {
        const allUsers = Object.values(res.data).flat();
        setUsers(allUsers);
      })
      .catch((err) => console.error('Error fetching users:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = filterText.toLowerCase();
    const matchesSearch =
      user.display_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search);

    const matchesVerified =
      verificationFilter === 'all'
        ? true
        : verificationFilter === 'verified'
          ? !!user.is_verified
          : !user.is_verified;

    return matchesSearch && matchesVerified;
  });

  // Custom styles for DataTable
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f8fafc',
        fontWeight: '600',
        fontSize: '14px',
        color: '#374151',
        paddingTop: '16px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#4b5563',
        paddingTop: '16px',
        paddingBottom: '16px',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    rows: {
      style: {
        borderBottom: '1px solid #f3f4f6',
        '&:hover': {
          backgroundColor: '#fafbfc',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '2px solid #e5e7eb',
        backgroundColor: '#fafbfc',
      },
    },
  };

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '70px',
      center: true,
      cell: (row, index) => (
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
      ),
    },
    {
      name: 'ชื่อผู้ใช้',
      selector: (row) => row.display_name,
      sortable: true,
      minWidth: '200px',
      cell: (row) => (
        <div className="flex items-center justify-start">
          {row.photo_url ? (
            // ✅ ถ้ามีรูป ให้แสดง <img>
            <img
              src={row.photo_url}
              alt={row.display_name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border mr-3"
            />
          ) : (
            // ❌ ถ้าไม่มีรูป ใช้ตัวอักษรแรกแบบเดิม
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {row.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.display_name || 'ไม่ระบุ'}</div>
          </div>
        </div>
      ),
    },
    {
      name: 'อีเมล',
      selector: (row) => row.email,
      sortable: true,
      minWidth: '250px',
      cell: (row) => (
        <div className="text-gray-600">
          {row.email ? (
            <a href={`mailto:${row.email}`} className="hover:text-blue-600 transition-colors">
              {row.email}
            </a>
          ) : (
            <span className="text-gray-400 italic">ไม่ได้ระบุ</span>
          )}
        </div>
      ),
    },
    {
      name: 'เบอร์โทร',
      selector: (row) => row.phone,
      minWidth: '150px',
      cell: (row) => (
        <div className="text-gray-600">
          {row.phone ? (
            <a href={`tel:${row.phone}`} className="hover:text-blue-600 transition-colors">
              {row.phone}
            </a>
          ) : (
            <span className="text-gray-400 italic">ไม่ได้ระบุ</span>
          )}
        </div>
      ),
    },
    {
      name: 'เพศ',
      selector: (row) => row.gender,
      width: '100px',
      center: true,
      cell: (row) => {
        const genderInfo = {
          0: { text: 'ชาย', color: 'bg-blue-100 text-blue-800', icon: '👨' },
          1: { text: 'หญิง', color: 'bg-pink-100 text-pink-800', icon: '👩' },
          default: { text: 'ไม่ระบุ', color: 'bg-gray-100 text-gray-800' }
        };
        const info = genderInfo[row.gender] || genderInfo.default;

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.color} inline-flex items-center space-x-1`}>
            <span>{info.icon}</span>
            <span>{info.text}</span>
          </span>
        );
      },
    },
    {
      name: 'วันเกิด',
      selector: (row) => row.birthdate,
      minWidth: '120px',
      cell: (row) => (
        <div className="text-gray-600">
          {row.birthdate ? (
            <div className="flex items-center space-x-1">
              <span>🎂</span>
              <span>{new Date(row.birthdate).toLocaleDateString('th-TH')}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic">ไม่ได้ระบุ</span>
          )}
        </div>
      ),
    },
    {
      name: 'Provider',
      selector: (row) => row.providers || 'unknown',
      width: '120px',
      center: true,
      cell: (row) => {
        const provider = row.providers || 'unknown';

        const renderGoogleText = () => (
          <span className="flex space-x-[1px] text-xs font-bold items-center">
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>o</span>
            <span style={{ color: '#FBBC05' }}>o</span>
            <span style={{ color: '#4285F4' }}>g</span>
            <span style={{ color: '#34A853' }}>l</span>
            <span style={{ color: '#EA4335' }}>e</span>
          </span>
        );

        // ✅ แก้ providerColors ให้ไม่ซ้ำ และใช้สีเหมาะสม
        const providerColors = {
          google: 'bg-gray-50 border border-gray-200 shadow-sm', // พื้นหลังอ่อน ให้ตัวอักษรโดดเด่น
          facebook: 'bg-[#1877F2] text-white font-semibold',     // Facebook สีจริง
          apple: 'bg-black text-white font-semibold',
          manual: 'bg-black text-white font-semibold',         // Apple ดำ
          unknown: 'bg-white text-gray-800 font-semibold',                 // Fallback
        };

        // ✅ ใช้ renderGoogleText() ถ้า provider เป็น google
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center justify-center ${providerColors[provider.toLowerCase()] || providerColors.unknown
              }`}
          >
            {provider.toLowerCase() === "google"
              ? renderGoogleText()
              : provider.charAt(0).toUpperCase() + provider.slice(1)}
          </span>
        );

      },
    },
    {
      name: 'สถานะการยืนยัน',
      selector: (row) => row.is_verified,
      width: '150px',
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center">
          {row.is_verified ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ยืนยันแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              ยังไม่ยืนยัน
            </span>
          )}
        </div>
      ),
    },
  ];

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
    </div>
  );

  const NoDataComponent = () => (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
      <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลผู้ใช้</h3>
      <p className="text-sm">ไม่มีผู้ใช้ที่ตรงกับการค้นหาของคุณ</p>
    </div>
  );

  // ✅ ถ้า loading ยัง true → แสดงหน้าโหลด
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">


          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  รายชื่อผู้ใช้งาน
                </h1>
                <p className="text-gray-600">
                  จัดการและดูรายละเอียดข้อมูลผู้ใช้งานทั้งหมด
                </p>
              </div>

              {/* Search Box and Verification Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
                    className="pl-10 pr-4 py-3 w-72 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  {filterText && (
                    <button
                      onClick={() => setFilterText('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <label className="sr-only">สถานะการยืนยัน</label>
                    <div className="relative">
                      <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer min-w-[140px]"
                      >
                        <option value="all">🔍 ทั้งหมด</option>
                        <option value="verified">✅ ยืนยันแล้ว</option>
                        <option value="unverified">⏳ ยังไม่ยืนยัน</option>
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Filter indicator badge */}
                    {verificationFilter !== 'all' && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  {/* Clear Filter Button (แสดงเมื่อมี filter active) */}
                  {(verificationFilter !== 'all' || filterText) && (
                    <button
                      onClick={() => {
                        setVerificationFilter('all');
                        setFilterText('');
                      }}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-all duration-200"
                      title="ล้างตัวกรอง"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Summary Cards (ย้ายมาไว้ด้านบน) */}
          <div className="mt-0 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ยืนยันแล้ว</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.is_verified).length.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ยังไม่ยืนยัน</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.filter(u => !u.is_verified).length.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <DataTable
                columns={columns}
                data={filteredUsers}
                pagination
                highlightOnHover
                responsive
                striped={false}
                customStyles={customStyles}
                paginationPerPage={20}
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                noDataComponent={<NoDataComponent />}
                paginationComponentOptions={{
                  rowsPerPageText: 'แถวต่อหน้า:',
                  rangeSeparatorText: 'จาก',
                  noRowsPerPage: false,
                  selectAllRowsItem: false,
                }}
                progressPending={loading}
                progressComponent={<LoadingSpinner />}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}