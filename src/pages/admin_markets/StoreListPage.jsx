import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Phone, Eye, CheckCircle, XCircle, Timer, Filter } from 'lucide-react';
import { useNavigate } from "react-router-dom";

import Navbar from '../../components/Navbar';
import { getAllMarketsAdmin } from '../../APIs/MarketAPI';

export default function StoreListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [modeFilter, setModeFilter] = useState('all'); // 'all', 'manual', 'auto'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await getAllMarketsAdmin(token);

        const mapped = (response.data || []).map((item) => ({
          market_id: item.market_id,
          shop_name: item.shop_name,
          shop_description: item.description,
          shop_logo_url: item.shop_logo_url,
          phone: item.phone,
          open_time: item.open_time,
          close_time: item.close_time,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          username: item.username,
          is_open: item.is_open,
          is_manual_override: item.is_manual_override,
          override_until: item.override_until,
        }));

        setStores(mapped);
      } catch (err) {
        console.error('ไม่สามารถโหลดร้านค้าได้', err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter((store) => {
    const search = filterText.toLowerCase();
    const matchesSearch = (
      store.shop_name?.toLowerCase().includes(search) ||
      store.username?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search)
    );

    const matchesMode = 
      modeFilter === 'all' ? true :
      modeFilter === 'manual' ? store.is_manual_override === true :
      modeFilter === 'auto' ? store.is_manual_override === false :
      true;

    return matchesSearch && matchesMode;
  });

  // นับจำนวนแต่ละโหมด
  const counts = {
    all: stores.length,
    manual: stores.filter(s => s.is_manual_override === true).length,
    auto: stores.filter(s => s.is_manual_override === false).length,
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0"></div>
            </div>
            <span className="text-lg font-semibold text-gray-700">กำลังโหลดข้อมูลร้านค้า...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-purple-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🏪 รายการร้านอาหาร
                </h1>
                <p className="text-gray-600 text-lg">
                  ร้านอาหารทั้งหมด <span className="font-bold text-purple-600">{stores.length}</span> ร้าน
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาร้าน, เจ้าของ, ที่อยู่..."
                  className="px-5 py-3.5 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-80 transition-all"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                <button
                  onClick={() => navigate("/admin/add-category")}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  📂 เพิ่มหมวดหมู่
                </button>
                <button
                  onClick={() => navigate("/admin/add-market")}
                  className="px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  ➕ เพิ่มร้านค้า
                </button>
              </div>
            </div>

            {/* Mode Filter */}
            <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span className="font-semibold">กรองตามโหมด:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setModeFilter('all')}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                    modeFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  📊 ทั้งหมด ({counts.all})
                </button>
                <button
                  onClick={() => setModeFilter('manual')}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                    modeFilter === 'manual'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-orange-200'
                  }`}
                >
                  🔧 ปรับเอง ({counts.manual})
                </button>
                <button
                  onClick={() => setModeFilter('auto')}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                    modeFilter === 'auto'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-blue-200'
                  }`}
                >
                  🤖 อัตโนมัติ ({counts.auto})
                </button>
              </div>
            </div>
          </div>

          {/* Store Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-xl border border-purple-100">
                <div className="text-8xl mb-6">🏪</div>
                <p className="text-gray-500 text-xl font-medium">ไม่พบข้อมูลร้านค้าที่ตรงกับการค้นหา</p>
                <p className="text-gray-400 mt-2">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div
                  key={store.market_id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100"
                >
                  {/* Store Image with Status Badge */}
                  <div className="relative h-52 bg-gradient-to-br from-purple-400 to-pink-400">
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
                    <div
                      className={`${store.shop_logo_url ? 'hidden' : 'flex'} absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 items-center justify-center`}
                    >
                      <div className="text-white text-7xl">🏪</div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {store.is_open ? (
                        <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold backdrop-blur-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>เปิด</span>
                        </div>
                      ) : (
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold backdrop-blur-sm">
                          <XCircle className="w-4 h-4" />
                          <span>ปิด</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Override Indicator */}
                    <div className="absolute top-4 left-4">
                      {store.is_manual_override ? (
                        <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm font-semibold backdrop-blur-sm">
                          <Timer className="w-3.5 h-3.5" />
                          <span>ปรับเอง</span>
                        </div>
                      ) : (
                        <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm font-semibold backdrop-blur-sm">
                          <span className="text-xs">🤖</span>
                          <span>อัตโนมัติ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-1 hover:text-purple-600 transition-colors">
                      {store.shop_name}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-4 bg-purple-50 rounded-lg p-2">
                      <User className="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" />
                      <span className="text-sm font-medium">{store.username || '—'}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {store.shop_description || 'ไม่มีคำอธิบาย'}
                    </p>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-2.5">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
                        <span className="text-sm font-medium">{store.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 bg-pink-50 rounded-lg p-2.5">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-pink-600" />
                        <span className="text-sm font-medium">
                          {store.open_time} - {store.close_time} น.
                        </span>
                      </div>
                      <div className="flex items-start text-gray-600 bg-indigo-50 rounded-lg p-2.5">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-indigo-600" />
                        <span className="text-sm line-clamp-2 leading-relaxed font-medium">
                          {store.address}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 mb-5 border border-purple-100">
                      <div className="text-xs text-gray-500 font-semibold mb-1">📍 พิกัดที่ตั้ง</div>
                      <div className="text-sm font-mono text-gray-700 font-medium">
                        {store.latitude}, {store.longitude}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(
                          `https://www.google.com/maps?q=${store.latitude},${store.longitude}`,
                          '_blank'
                        )}
                        className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                      >
                        <MapPin className="w-5 h-5 mr-2" />
                        เปิดใน Google Maps
                      </button>

                      <button
                        onClick={() => navigate(`/admin/store/${store.market_id}`)}
                        className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        ดูรายละเอียด
                      </button>
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