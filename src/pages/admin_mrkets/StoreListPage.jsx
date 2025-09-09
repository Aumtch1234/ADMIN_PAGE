import { useEffect, useState } from 'react';
import { MapPin, Clock, User, Phone, Eye } from 'lucide-react';
import { useNavigate } from "react-router-dom";


import Navbar from '../../components/Navbar';
import { getAllMarketsAdmin } from '../../APIs/MarketAPI';

export default function StoreListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await getAllMarketsAdmin(token);

        // ✅ mapping fields จาก API ให้เข้ากับ UI
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
    return (
      store.shop_name?.toLowerCase().includes(search) ||
      store.owner_name?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">กำลังโหลดข้อมูลร้านค้า...</span>
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
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🏪 รายการร้านอาหาร</h1>
              <p className="text-gray-600">ร้านอาหารทั้งหมดที่แอดมินเพิ่มเข้ามา</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="🔍 ค้นหาร้าน, เจ้าของ, ที่อยู่..."
                className="px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <button
                onClick={() => navigate("/admin/add-category")}
                className="px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 shadow-sm"
              >
                ➕ เพิ่มหมวดหมู่
              </button>
              <button
                onClick={() => navigate("/admin/add-market")}
                className="px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 shadow-sm"
              >
                ➕ เพิ่มร้านค้า
              </button>
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
                <div
                  key={store.market_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
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
                    <div
                      className={`${store.shop_logo_url ? 'hidden' : 'flex'
                        } absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center`}
                    >
                      <div className="text-white text-6xl">🏪</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {store.shop_name}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{store.username || '—'}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {store.shop_description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{store.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          {store.open_time} - {store.close_time} น.
                        </span>
                      </div>
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm line-clamp-2 leading-relaxed">
                          {store.address}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">พิกัดที่ตั้ง</div>
                      <div className="text-sm font-mono text-gray-700">
                        {store.latitude}, {store.longitude}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/store/${store.market_id}`)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </button>

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
