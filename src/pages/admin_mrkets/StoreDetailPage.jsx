import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Star, Edit, Plus, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getFoodsWithMarket, updateMarket } from "../../APIs/MarketAPI";

import FoodDialog from "../../components/admin_markets/FoodDialog";
import StoreEditDialog from "../../components/admin_markets/StoreEditDialog";

export default function StoreDetailPage() {
    const { marketId } = useParams();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEditStoreDialog, setShowEditStoreDialog] = useState(false);
    const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
    const [showEditFoodDialog, setShowEditFoodDialog] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);

    const [storeForm, setStoreForm] = useState({});
    const [savingStore, setSavingStore] = useState(false);

    // ✅ ดึงรายการอาหาร + ข้อมูลร้าน ให้เรียกใช้ซ้ำได้
    const fetchFoods = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const foodRes = await getFoodsWithMarket(marketId, token);
            const foodsArray = Array.isArray(foodRes?.data?.data) ? foodRes.data.data : [];

            if (foodsArray.length > 0) {
                const first = foodsArray[0];
                const storeData = {
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
                };
                setStore(storeData);
                setStoreForm({
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
            } else {
                // ไม่มีเมนูเลย แต่ก็ล้าง foods ให้ชัดเจน
                setFoods([]);
            }

            setFoods(foodsArray.filter((f) => f.food_id !== null));
        } catch (err) {
            console.error("โหลดข้อมูลร้านล้มเหลว", err);
        } finally {
            setLoading(false);
        }
    }, [marketId]);

    // โหลดครั้งแรก
    useEffect(() => {
        fetchFoods();
    }, [fetchFoods]);

    const handleEditStore = () => setShowEditStoreDialog(true);
    const handleAddFood = () => setShowAddFoodDialog(true);
    const handleEditFood = (food) => {
        setSelectedFood(food);
        setShowEditFoodDialog(true);
    };

    const handleSaveStore = async () => {
    if (savingStore) return;
    try {
        setSavingStore(true);
        const token = localStorage.getItem("token");
        const formData = new FormData();
        
        // เพิ่มข้อมูลทั้งหมด
        Object.keys(storeForm).forEach(key => {
            if (key === 'shop_logo_file' && storeForm[key]) {
                formData.append('shop_logo_url', storeForm[key]);
            } else if (key !== 'shop_logo_file' && key !== 'shop_logo_url') {
                formData.append(key, storeForm[key]);
            }
        });

        await updateMarket(marketId, formData, token); // เรียก API
        await fetchFoods(); // โหลดข้อมูลใหม่
        setShowEditStoreDialog(false);
        alert("อัปเดตร้านค้าสำเร็จ");
    } catch (e) {
        console.error(e);
        alert("บันทึกข้อมูลร้านค้าไม่สำเร็จ");
    } finally {
        setSavingStore(false);
    }
};

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
                            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 absolute top-0"></div>
                        </div>
                        <span className="text-lg font-medium text-gray-700">กำลังโหลดข้อมูลร้านค้า...</span>
                    </div>
                </div>
            </>
        );
    }

    if (!store) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🏪</div>
                        <p className="text-gray-600 text-xl font-medium">ไม่พบข้อมูลร้านค้า</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">กลับ</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-purple-100">
                        <div className="relative">
                            {store.shop_logo_url && (
                                <div className="relative h-80 overflow-hidden">
                                    <img src={store.shop_logo_url} alt={store.shop_name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>
                            )}

                            <button
                                onClick={handleEditStore}
                                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-purple-600 px-5 py-2.5 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                แก้ไขร้านค้า
                            </button>
                        </div>

                        <div className="p-8">
                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {store.shop_name}
                            </h1>

                            {store.description && <p className="text-gray-600 text-lg mb-6 leading-relaxed">{store.description}</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {store.phone && (
                                    <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <Phone className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">เบอร์โทรศัพท์</p>
                                            <p className="text-gray-800 font-medium">{store.phone}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-4">
                                    <div className="bg-pink-100 p-2 rounded-lg">
                                        <Clock className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">เวลาเปิด-ปิด</p>
                                        <p className="text-gray-800 font-medium">
                                            {store.open_time} - {store.close_time} น.
                                        </p>
                                    </div>
                                </div>

                                {store.address && (
                                    <div className="flex items-start gap-3 bg-indigo-50 rounded-xl p-4 md:col-span-2">
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">ที่อยู่</p>
                                            <p className="text-gray-800 font-medium">{store.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(store.latitude || store.longitude) && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium mb-1">พิกัดที่ตั้ง</p>
                                    <p className="text-gray-700 font-mono text-sm">
                                        {store.latitude}, {store.longitude}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="text-4xl">🍽️</span>
                                รายการอาหาร
                            </h2>
                            <p className="text-gray-600 mt-1">เมนูอาหารทั้งหมด {foods.length} รายการ</p>
                        </div>

                        <button
                            onClick={handleAddFood}
                            className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                            เพิ่มเมนูอาหาร
                        </button>
                    </div>

                    {foods.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-purple-100">
                            <div className="text-7xl mb-4">🍽️</div>
                            <p className="text-gray-500 text-lg mb-4">ร้านค้ายังไม่มีรายการอาหาร</p>
                            <p className="text-gray-400 text-sm">คลิกปุ่ม "เพิ่มเมนูอาหาร" เพื่อเริ่มต้น</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {foods.map((food) => (
                                <div
                                    key={food.food_id}
                                    onClick={() => handleEditFood(food)}
                                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-purple-100 hover:border-purple-300"
                                >
                                    <div className="relative h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                                        {food.image_url ? (
                                            <>
                                                <img
                                                    src={food.image_url}
                                                    alt={food.food_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300 text-7xl group-hover:scale-110 transition-transform duration-300">
                                                🍽️
                                            </div>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-xl">
                                                <Edit className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                                            {food.food_name}
                                        </h3>

                                        {food.category_name && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{food.category_name}</p>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-purple-600">{food.price}</span>
                                                <span className="text-sm text-gray-500 font-medium">บาท</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold text-gray-700">{food.rating || "0.0"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <StoreEditDialog
                open={showEditStoreDialog}
                value={storeForm}
                onChange={setStoreForm}
                onClose={() => setShowEditStoreDialog(false)}
                onSave={handleSaveStore}
                saving={savingStore}
            />

            <FoodDialog
                open={showAddFoodDialog}
                isEdit={false}
                marketId={marketId} // ✅ ส่ง marketId
                onClose={() => setShowAddFoodDialog(false)}
                onSaved={async () => {
                    await fetchFoods();          // 🔥 โหลดใหม่จาก API ทันที
                    setShowAddFoodDialog(false); // ปิด dialog
                }}
            />

            <FoodDialog
                open={showEditFoodDialog}
                isEdit={true}
                selectedFood={selectedFood}
                marketId={marketId}
                onClose={() => setShowEditFoodDialog(false)}
                onSaved={async () => {
                    await fetchFoods();            // 🔥 โหลดใหม่จาก API (กันข้อมูลฝั่ง server ไม่ตรงกับที่เรา map เอง)
                    setShowEditFoodDialog(false);  // ปิด dialog
                }}
            />
        </>
    );
}
