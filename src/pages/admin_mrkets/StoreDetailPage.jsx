import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Star } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getFoodsWithMarket } from "../../APIs/MarketAPI";


export default function StoreDetailPage() {
    const { marketId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            try {
                const foodRes = await getFoodsWithMarket(marketId, token);

                // foodRes.data.data คือ array ของ foods
                const foodsArray = Array.isArray(foodRes.data.data) ? foodRes.data.data : [];

                // ถ้ามีร้าน
                if (foodsArray.length > 0) {
                    const first = foodsArray[0];
                    setStore({
                        market_id: first.market_id,
                        shop_name: first.shop_name,
                        shop_logo_url: first.shop_logo_url,
                        address: first.address,
                        phone: first.phone,
                        open_time: first.open_time,
                        close_time: first.close_time,
                        latitude: first.latitude,
                        longitude: first.longitude,
                        description: first.description,
                    });
                }

                // กรองอาหารที่ไม่ใช่ null
                setFoods(foodsArray.filter(f => f.food_id !== null));

            } catch (err) {
                console.error("โหลดข้อมูลร้านล้มเหลว", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [marketId]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="flex items-center gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                        <span className="text-lg text-gray-600">กำลังโหลดข้อมูลร้านค้า...</span>
                    </div>
                </div>
            </>
        );
    }

    if (!store) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500 text-lg">ไม่พบข้อมูลร้านค้า</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
                >
                    ◀ กลับ
                </button>

                {/* ร้านค้า */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    {store.shop_logo_url && (
                        <img
                            src={store.shop_logo_url}
                            alt={store.shop_name}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-2">{store.shop_name}</h1>
                        <p className="text-gray-600 mb-4">{store.description}</p>

                        <div className="flex flex-col md:flex-row gap-6 text-gray-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{store.phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {store.open_time} - {store.close_time} น.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>{store.address}</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 font-mono">
                            พิกัด: {store.latitude}, {store.longitude}
                        </div>
                    </div>
                </div>

                {/* รายการอาหาร */}
                <h2 className="text-2xl font-bold mb-4">🍔 รายการอาหาร</h2>
                {foods.length === 0 ? (
                    <p className="text-gray-500 mb-8">ร้านค้ายังไม่มีรายการอาหาร</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {foods.map((food) => (
                            <div
                                key={food.food_id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="h-48 bg-gray-200">
                                    {food.image_url ? (
                                        <img
                                            src={food.image_url}
                                            alt={food.food_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                                            🍽️
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold mb-1">{food.food_name}</h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{food.description}</p>
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span className="font-semibold">{food.price} ฿</span>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star className="w-4 h-4" />
                                            <span>{food.rating || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
