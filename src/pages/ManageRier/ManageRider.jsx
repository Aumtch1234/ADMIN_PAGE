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

      // fetch counts in parallel (use small requests). Fallback checks for common keys.
      const [allResResult, pendingResResult] = await Promise.allSettled([
        getAllRiders({ status: 'all', limit: 1, page: 1 }),
        getPendingRiders(1, 1)
      ]);

      const parseCount = (resSettled) => {
        if (!resSettled || resSettled.status === 'rejected') return 0;
        const res = resSettled.value;
        const data = res?.data ?? {};
        if (typeof data.total === 'number') return data.total;
        if (typeof data.count === 'number') return data.count;
        if (Array.isArray(data.riders)) return data.riders.length;
        if (Array.isArray(data)) return data.length;
        // as last resort, if response has meta or pagination
        if (data.meta && typeof data.meta.total === 'number') return data.meta.total;
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
      minWidth: '200px',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {row.display_name?.charAt(0).toUpperCase() || '?'}
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
      width: '120px',
      center: true,
      cell: (row) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        const statusText = {
          pending: 'รออนุมัติ',
          approved: 'อนุมัติแล้ว',
          rejected: 'ปฏิเสธ'
        };
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.approval_status] || 'bg-gray-100 text-gray-800'}`}>
            {statusText[row.approval_status] || row.approval_status}
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
      width: '200px',
      center: true,
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/riders/${row.rider_id}`}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            ดูรายละเอียด
          </Link>
          
          {row.approval_status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.rider_id)}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                อนุมัติ
              </button>
              <button
                onClick={() => openRejectModal(row)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการไรเดอร์</h1>
            <p className="text-gray-600">จัดการข้อมูลและอนุมัติไรเดอร์ในระบบ</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ไรเดอร์ทั้งหมด ({totalCount})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ไรเดอร์ที่รออนุมัติ ({pendingCount})
                </button>
              </nav>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
                className="pl-10 pr-4 py-3 w-96 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredRiders}
              pagination
              highlightOnHover
              responsive
              progressPending={loading}
              paginationPerPage={20}
              paginationRowsPerPageOptions={[10, 20, 50]}
              noDataComponent={
                <div className="p-8 text-center text-gray-500">
                  <p>ไม่พบข้อมูลไรเดอร์</p>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">ปฏิเสธไรเดอร์</h3>
            <p className="text-gray-600 mb-4">
              กรุณาระบุเหตุผลในการปฏิเสธไรเดอร์: {selectedRider?.display_name}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded p-3 mb-4"
              rows="4"
              placeholder="ระบุเหตุผล..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}