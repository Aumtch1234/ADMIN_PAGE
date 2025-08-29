import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Phone, CheckCircle, XCircle, Eye } from 'lucide-react';

import Navbar from '../components/Navbar';
import { getAllStores, approveStore, rejectStore } from '../APIs/MarketAPI';

export default function StoreApprovalPage() {
  const [stores, setStores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await getAllStores(token);
        setStores(response.data || []);
      } catch (err) {
        console.error('ไม่สามารถโหลดร้านค้าได้', err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // แปลงข้อมูลให้ตรงกับ UI (ไม่จำเป็นแล้วเพราะข้อมูลจาก API ตรงกับที่ต้องการ)
  const normalizedStores = stores;

  const filteredStores = normalizedStores.filter((store) => {
    const search = filterText.toLowerCase();
    const matchesSearch =
      store.shop_name?.toLowerCase().includes(search) ||
      store.owner_name?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search);
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && store.approve === false) ||
      (statusFilter === 'approved' && store.approve === true) ||
      (statusFilter === 'rejected' && store.approve === null);

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (marketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await approveStore(marketId, token);
      console.log('Approve response:', response.data);
      
      // อัปเดต state ด้วยข้อมูลที่ได้จาก API response
      setStores(stores.map(s => 
        s.market_id === marketId ? { ...s, approve: true } : s
      ));
      
      // แสดงข้อความสำเร็จ
      alert('อนุมัติร้านค้าเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error approving store:', err);
      alert('เกิดข้อผิดพลาดในการอนุมัติร้านค้า: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (marketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await rejectStore(marketId, token);
      console.log('Reject response:', response.data);
      
      // อัปเดต state ด้วยข้อมูลจาก API response
      setStores(stores.map(s => 
        s.market_id === marketId ? { ...s, approve: false } : s
      ));
      
      // แสดงข้อความสำเร็จ
      alert('ปฏิเสธร้านค้าเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error rejecting store:', err);
      alert('เกิดข้อผิดพลาดในการปฏิเสธร้านค้า: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (approve) => {
    if (approve === true) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />อนุมัติแล้ว</span>;
    } else if (approve === false) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1" />รออนุมัติ</span>;
    } else {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><XCircle className="w-4 h-4 mr-1" />ปฏิเสธ</span>;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600">กำลังโหลดข้อมูル...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🏪 อนุมัติร้านค้า
                </h1>
                <p className="text-gray-600">จัดการคำขออนุมัติร้านค้าและธุรกิจต่างๆ</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาร้าน, เจ้าของ, ที่อยู่..."
                  className="px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-80"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
              </div>
            </div>

            {/* Statistics - สำหรับร้านค้าทั้งหมด */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="text-yellow-600 text-sm font-medium">รออนุมัติ</div>
                <div className="text-2xl font-bold text-yellow-800">
                  {stores.filter(s => s.approve === false).length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="text-green-600 text-sm font-medium">อนุมัติแล้ว</div>
                <div className="text-2xl font-bold text-green-800">
                  {stores.filter(s => s.approve === true).length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="text-red-600 text-sm font-medium">ปฏิเสธ</div>
                <div className="text-2xl font-bold text-red-800">
                  {stores.filter(s => s.approve === null).length}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-blue-600 text-sm font-medium">ทั้งหมด</div>
                <div className="text-2xl font-bold text-blue-800">{stores.length}</div>
              </div>
            </div>
          </div>

          {/* Store Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏪</div>
                <p className="text-gray-500 text-lg">ไม่พบข้อมูลร้านค้าที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.market_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Store Image */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    {store.shop_logo_url ? (
                      <img
                        src={store.shop_logo_url}
                        alt={store.shop_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${store.shop_logo_url ? 'hidden' : 'flex'} absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center`}>
                      <div className="text-white text-6xl">🏪</div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(store.approve)}
                    </div>

                    {/* Category Tag */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        ร้านอาหาร
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Store Name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {store.shop_name}
                    </h3>

                    {/* Owner Info */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{store.owner_name}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {store.shop_description}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{store.phone}</span>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="flex items-center text-gray-600 mb-4">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {store.open_time} - {store.close_time} น.
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm line-clamp-2 leading-relaxed">
                        {store.address}
                      </span>
                    </div>

                    {/* Coordinates */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">พิกัดที่ตั้ง</div>
                      <div className="text-sm font-mono text-gray-700">
                        {store.latitude}, {store.longitude}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200">
                        <Eye className="w-4 h-4 mr-2" />
                        ดูรายละเอียด
                      </button>

                      {/* แสดงปุ่มอนุมัติ/ปฏิเสธ เฉพาะร้านที่รออนุมัติ */}
                      {store.approve === false && (
                        <>
                          <button
                            onClick={() => handleApprove(store.market_id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleReject(store.market_id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            ปฏิเสธ
                          </button>
                        </>
                      )}
                    </div>

                    {/* Submission Date */}
                    <div className="text-xs text-gray-400 mt-3 text-center">
                      ยื่นขอเมื่อ: {new Date(store.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}