import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Phone, CheckCircle, XCircle, Eye, Map } from 'lucide-react';

import Navbar from '../components/Navbar';
import StoreDetailDialog from '../components/storesDetails/StoreDetailDialog';
import { getAllStores, approveStore, rejectStore } from '../APIs/MarketAPI';

export default function StoreApprovalPage() {
  const [stores, setStores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // ✅ state สำหรับรูปภาพเต็ม


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

  const handleViewDetails = (store) => {
    setSelectedStore(store);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedStore(null);
  };

  const handleApprove = async (marketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await approveStore(marketId, token);
      console.log('Approve response:', response.data);

      setStores(stores.map(s =>
        s.market_id === marketId ? { ...s, approve: true } : s
      ));

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

      setStores(stores.map(s =>
        s.market_id === marketId ? { ...s, approve: false } : s
      ));

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
              <span className="ml-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
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

            {/* Statistics */}
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
          {/* Store Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div key={store.market_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">

                {/* 📍 รูปภาพร้าน */}
                <div className="relative h-48 cursor-pointer" onClick={() => setImagePreview(store.shop_logo_url)}>
                  {store.shop_logo_url ? (
                    <img
                      src={store.shop_logo_url}
                      alt={store.shop_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl">🏪</div>
                  )}

                  {/* ✅ is_open badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${store.is_open ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {store.is_open ? 'เปิดร้าน' : 'ปิดร้าน'}
                  </div>

                  {/* สถานะอนุมัติ */}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(store.approve)}
                  </div>
                </div>

                {/* ✅ รายละเอียดร้าน */}
                <div className="p-6">
                  {/* ชื่อร้าน */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {store.shop_name}
                  </h3>

                  {/* ✅ คำอธิบาย */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {store.shop_description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>

                  {/* เจ้าของร้าน */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{store.owner_name}</span>
                  </div>

                  {/* เบอร์โทร */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{store.phone || 'ไม่ระบุ'}</span>
                  </div>

                  {/* เวลาทำการ */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {store.open_time} - {store.close_time} น.
                    </span>
                  </div>

                  {/* ที่อยู่ */}
                  <div className="flex items-start text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="text-sm line-clamp-2">{store.address || 'ไม่ระบุที่อยู่'}</span>
                  </div>

                  {/* พิกัด */}
                  <div className="flex items-start text-gray-600 mb-2">
                    <Map className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="text-sm line-clamp-2">{`${store.latitude}, ${store.longitude}` || 'ไม่ระบุพิกัดที่อยู่'}</span>
                  </div>

                  {/* ✅ พิกัดร้าน */}
                  {store.latitude && store.longitude && (
                    <div className="mt-2 mb-4">
                      <a
                        href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline mt-1"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        ดูตำแหน่งร้านบน Google Maps
                      </a>
                    </div>
                  )}


                  {/* ปุ่มดูรายละเอียด */}
                  <button
                    onClick={() => handleViewDetails(store)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    ดูรายละเอียดเพิ่มเติม
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Modal แสดงรูปภาพเต็ม */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
          onClick={() => setImagePreview(null)}
        >
          <img src={imagePreview} alt="preview" className="max-w-3xl max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}

      {/* Store Detail Dialog */}
      <StoreDetailDialog
        store={selectedStore}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
}