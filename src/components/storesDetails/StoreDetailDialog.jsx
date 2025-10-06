import { useEffect, useState } from 'react';
import { X, MapPin, Clock, User, Phone, Package, DollarSign, Image, Star, Tag } from 'lucide-react';
import { getFoodsWithMarket } from '../../APIs/MarketAPI';

export default function StoreDetailDialog({ store, isOpen, onClose }) {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // ✅ สำหรับ Lightbox


    useEffect(() => {
        if (isOpen && store) {
            fetchFoods();
        }
    }, [isOpen, store]);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await getFoodsWithMarket(store.market_id, token);

            const raw = response?.data?.data ?? response?.data ?? response ?? [];
            const list = Array.isArray(raw) ? raw : [raw];

            const normalized = list.map((item) => ({
                food_id: item.food_id ?? item.id ?? null,
                food_name: item.food_name ?? item.name ?? '',
                food_description: item.description ?? item.food_description ?? item.detail ?? '',
                food_price: item.sell_price ?? item.price ?? item.food_price ?? 0,
                original_price: item.price ?? item.food_price ?? 0,
                food_picture: item.image_url ?? item.food_picture ?? '',
                food_status:
                    item.food_status ??
                    (item.status ? String(item.status) : undefined) ??
                    ((item.active === 0 || item.active === false) ? 'unavailable' : 'available'),
                rating: item.rating ? parseFloat(item.rating) : null,
                options: Array.isArray(item.options) ? item.options : [],
                sell_options: Array.isArray(item.sell_options) ? item.sell_options : [],
                category_name: item.category_name ?? '',
                category_image_url: item.category_image_url ?? '',
            }));

            setFoods(normalized);
        } catch (err) {
            console.error('ไม่สามารถโหลดรายการอาหารได้', err);
            setFoods([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !store) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative">
                    <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                        {store.shop_logo_url ? (
                            <img
                                src={store.shop_logo_url}
                                alt={store.shop_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-white text-8xl">🏪</div>
                            </div>
                        )}

                        {/* ✅ is_open Badge */}
                        <div className={`absolute top-4 left-4 px-4 py-1 rounded-full text-xs font-semibold ${store.is_open ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                            {store.is_open ? 'เปิดร้าน' : 'ปิดร้าน'}
                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{store.shop_name}</h2>
                        <p className="text-white/90 text-sm">{store.shop_description}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Store Information */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลร้านค้า</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-700">
                                <User className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">เจ้าของร้าน</div>
                                    <div className="font-medium">{store.owner_name}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-700">
                                <Phone className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">เบอร์โทรศัพท์</div>
                                    <div className="font-medium">{store.phone}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-700">
                                <Clock className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">เวลาทำการ</div>
                                    <div className="font-medium">{store.open_time} - {store.close_time} น.</div>
                                </div>
                            </div>

                            <div className="flex items-start text-gray-700 md:col-span-2">
                                <MapPin className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="text-xs text-gray-500">ที่อยู่</div>
                                    <div className="font-medium">{store.address}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">
                                        {store.latitude}, {store.longitude}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Foods Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <Package className="w-6 h-6 mr-2 text-orange-500" />
                                รายการอาหาร ({foods.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">กำลังโหลดรายการอาหาร...</span>
                            </div>
                        ) : foods.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <div className="text-gray-400 text-5xl mb-3">🍽️</div>
                                <p className="text-gray-500">ยังไม่มีรายการอาหาร</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {foods.map((food) => (
                                    <div
                                        key={food.food_id}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex">
                                            {/* Food Image */}
                                            {/* Food Image */}
                                            <div
                                                className="w-40 h-40 flex-shrink-0 bg-gray-100 relative cursor-pointer group"
                                                onClick={() => food.food_picture && setImagePreview(food.food_picture)} // ✅ เมื่อกดแล้วเปิด Lightbox
                                            >
                                                {food.food_picture ? (
                                                    <img
                                                        src={food.food_picture}
                                                        alt={food.food_name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}

                                                <div
                                                    className={`${food.food_picture ? 'hidden' : 'flex'
                                                        } absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 items-center justify-center`}
                                                >
                                                    <Image className="w-8 h-8 text-white" />
                                                </div>

                                                {/* Category Badge */}
                                                {food.category_name && (
                                                    <div className="absolute top-2 left-2">
                                                        <span className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                                            {food.category_name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>


                                            {/* Food Info */}
                                            <div className="flex-1 p-4 flex flex-col">
                                                <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">
                                                    {food.food_name}
                                                </h4>

                                                {/* Rating */}
                                                {food.rating !== null && (
                                                    <div className="flex items-center mb-2">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="ml-1 text-sm font-medium text-gray-700">
                                                            {food.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}

                                                {food.options && food.options.length > 0 && (
                                                    <div className="mb-2">
                                                        <div className="flex items-center mb-1">
                                                            <Tag className="w-3 h-3 text-blue-500 mr-1" />
                                                            <span className="text-xs text-gray-500 font-medium">ตัวเลือก:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {food.options.slice(0, 3).map((opt, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                                                                >
                                                                    {opt.label} +{opt.extraPrice}฿
                                                                </span>
                                                            ))}
                                                            {food.options.length > 3 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{food.options.length - 3} เพิ่มเติม
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center text-green-600 font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-500">ราคาขาย</span>
                                                            <span className="text-base font-semibold text-green-700">
                                                                {food.food_price} บาท
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {food.original_price && food.original_price !== food.food_price ? (
                                                        <div className="text-right ml-4">
                                                            <div className="text-xs text-black-500">ราคาที่ตั้ง</div>
                                                            <div className="text-xs text-black-400 font-extrabold">
                                                                {food.original_price} บาท
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        ปิด
                    </button>
                </div>

                {/* ✅ Lightbox รูปภาพ */}
                {imagePreview && (
                    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center cursor-zoom-out" onClick={() => setImagePreview(null)}>
                        <img src={imagePreview} alt="preview" className="max-w-3xl max-h-[90vh] rounded-lg shadow-2xl" />
                    </div>
                )}
            </div>
        </div>
    );
}