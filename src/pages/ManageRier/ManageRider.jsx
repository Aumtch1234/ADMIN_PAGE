import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Navbar from '../../components/Navbar';
import { getAllRiders, getPendingRiders, approveRider, rejectRider } from '../../APIs/RiderAPI';
import { jwtDecode } from 'jwt-decode';

export default function ManageRider() {
  const [activeTab, setActiveTab] = useState('all');
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchText, setSearchText] = useState('');

  // new states for counts
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  const token = localStorage.getItem('token');
  const adminId = token ? jwtDecode(token).id : null;

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'pending') {
        response = await getPendingRiders(1, 100);
      } else {
        response = await getAllRiders({ status: 'all', limit: 100 });
      }
      setRiders(response.data.riders || []);

      // Fetch counts - get the first page to get total_records from pagination
      const [allResResult, pendingResResult] = await Promise.allSettled([
        getAllRiders({ status: 'all', limit: 10, page: 1 }),
        getPendingRiders(1, 10)
      ]);

      const parseCount = (resSettled) => {
        if (!resSettled || resSettled.status === 'rejected') return 0;
        const res = resSettled.value;
        const data = res?.data ?? {};
        
        // Check pagination.total_records first (based on your API response)
        if (data.pagination && typeof data.pagination.total_records === 'number') {
          return data.pagination.total_records;
        }
        
        // Fallback checks for other common keys
        if (typeof data.total === 'number') return data.total;
        if (typeof data.count === 'number') return data.count;
        if (typeof data.total_records === 'number') return data.total_records;
        if (Array.isArray(data.riders)) return data.riders.length;
        if (Array.isArray(data)) return data.length;
        
        // Check meta or other nested objects
        if (data.meta && typeof data.meta.total === 'number') return data.meta.total;
        if (data.meta && typeof data.meta.total_records === 'number') return data.meta.total_records;
        
        return 0;
      };

      setTotalCount(parseCount(allResResult));
      setPendingCount(parseCount(pendingResResult));
    } catch (error) {
      console.error('Error fetching riders:', error);
      setRiders([]);
      setTotalCount(0);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const filteredRiders = riders.filter((rider) => {
    const search = searchText.toLowerCase();
    return (
      rider.display_name?.toLowerCase().includes(search) ||
      rider.email?.toLowerCase().includes(search) ||
      rider.phone?.includes(search)
    );
  });
// ด้วย admin_id ที่อนุมัติเช่น { "admin_id": 1, "reason": "เอกสารไม่ครบ" }
  const handleApprove = async (riderId) => {
    try {
      await approveRider(riderId, adminId);
      alert('อนุมัติไรเดอร์สำเร็จ');
      fetchRiders();
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    try {
      await rejectRider(selectedRider.rider_id, adminId, rejectReason);
      alert('ปฏิเสธไรเดอร์สำเร็จ');
      setShowModal(false);
      setRejectReason('');
      fetchRiders();
    } catch (error) {
      console.error('Error rejecting rider:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const openRejectModal = (rider) => {
    setSelectedRider(rider);
    setShowModal(true);
  };

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '70px',
      center: true,
    },
    {
      name: 'ชื่อผู้ใช้',
      selector: (row) => row.display_name,
      sortable: true,
      minWidth: '220px',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white">
            {row.photo_url ? (
              <img 
                src={row.photo_url} 
                alt={`${row.display_name || 'ไรเดอร์'} Profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg ${row.photo_url ? 'hidden' : 'flex'}`}
            >
              {row.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.display_name || 'ไม่ระบุ'}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      name: 'เบอร์โทร',
      selector: (row) => row.phone,
      minWidth: '130px',
    },
    {
      name: 'ประเภทยานพาหนะ',
      selector: (row) => row.vehicle_type,
      minWidth: '150px',
      cell: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
          {row.vehicle_type || 'ไม่ระบุ'}
        </span>
      ),
    },
    {
      name: 'สถานะ',
      selector: (row) => row.approval_status,
      width: '140px',
      center: true,
      cell: (row) => {
        const statusConfig = {
          pending: {
            bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            text_display: 'รออนุมัติ'
          },
          approved: {
            bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
            text: 'text-green-800',
            border: 'border-green-300',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ),
            text_display: 'อนุมัติแล้ว'
          },
          rejected: {
            bg: 'bg-gradient-to-r from-red-100 to-pink-100',
            text: 'text-red-800',
            border: 'border-red-300',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ),
            text_display: 'ปฏิเสธ'
          }
        };
        
        const config = statusConfig[row.approval_status] || {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: null,
          text_display: row.approval_status
        };
        
        return (
          <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${config.bg} ${config.text} ${config.border}`}>
            {config.icon}
            <span>{config.text_display}</span>
          </span>
        );
      },
    },
    {
      name: 'วันที่สมัคร',
      selector: (row) => row.submitted_at,
      minWidth: '150px',
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.submitted_at ? new Date(row.submitted_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
        </div>
      ),
    },
    {
      name: 'การดำเนินการ',
      width: '220px',
      center: true,
      cell: (row) => (
        <div className="flex flex-col space-y-2">
          <Link
            to={`/riders/${row.rider_id}`}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg w-full"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>ดูรายละเอียด</span>
          </Link>
          
          {row.approval_status === 'pending' && (
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => handleApprove(row.rider_id)}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg w-full"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>อนุมัติ</span>
              </button>
              <button
                onClick={() => openRejectModal(row)}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg w-full"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>ปฏิเสธ</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="p-6 max-w-9xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                จัดการไรเดอร์
              </h1>
              <p className="text-gray-500 text-lg">จัดการข้อมูลและอนุมัติไรเดอร์ในระบบ</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                  <p className="text-sm text-gray-600">ไรเดอร์ทั้งหมด</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                  <p className="text-sm text-gray-600">รออนุมัติ</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{totalCount - pendingCount}</p>
                  <p className="text-sm text-gray-600">ได้รับการอนุมัติ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>ไรเดอร์ทั้งหมด</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                  activeTab === 'all' 
                    ? 'bg-white text-blue-600 border-white' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {totalCount}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>ไรเดอร์ที่รออนุมัติ</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                  activeTab === 'pending' 
                    ? 'bg-white text-orange-600 border-white' 
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}>
                  {pendingCount}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 max-w-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2.5 rounded-xl">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Data Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h2m0-12h2m0 12h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0v12m0-12h4m-4 12h4" />
              </svg>
              รายการไรเดอร์ {filteredRiders.length > 0 && `(${filteredRiders.length} รายการ)`}
            </h3>
          </div>
          <DataTable
            columns={columns}
            data={filteredRiders}
            pagination
            highlightOnHover
            responsive
            progressPending={loading}
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50]}
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  minHeight: '60px'
                }
              },
              headCells: {
                style: {
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  paddingLeft: '16px',
                  paddingRight: '16px'
                }
              },
              rows: {
                style: {
                  minHeight: '85px',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    cursor: 'pointer'
                  }
                }
              },
              cells: {
                style: {
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  fontSize: '14px',
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }
              }
            }}
            noDataComponent={
              <div className="p-12 text-center">
                <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลไรเดอร์</p>
                <p className="text-gray-400 text-sm mt-2">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Enhanced Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ปฏิเสธไรเดอร์</h3>
              <p className="text-gray-600">
                กรุณาระบุเหตุผลในการปฏิเสธไรเดอร์: <span className="font-semibold text-gray-800">{selectedRider?.display_name}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">เหตุผลในการปฏิเสธ *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 resize-none"
                rows="4"
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธอย่างละเอียด..."
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>ยกเลิก</span>
              </button>
              <button
                onClick={handleReject}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>ยืนยันปฏิเสธ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}