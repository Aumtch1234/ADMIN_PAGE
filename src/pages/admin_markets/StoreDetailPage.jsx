import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Star, Edit, Plus, ArrowLeft, Power, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getFoodsWithMarket, updateMarket, ToggleStoreStatus, IsManualMarket } from "../../APIs/MarketAPI";
import FoodDialog from "../../components/admin_markets/FoodDialog";
import StoreEditDialog from "../../components/admin_markets/StoreEditDialog";

// ==================== Toast Component ====================
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: {
            bgColor: 'from-green-500 to-emerald-500',
            icon: <CheckCircle className="w-6 h-6" />
        },
        error: {
            bgColor: 'from-red-500 to-rose-500',
            icon: <XCircle className="w-6 h-6" />
        },
        info: {
            bgColor: 'from-blue-500 to-cyan-500',
            icon: <AlertCircle className="w-6 h-6" />
        }
    };

    const { bgColor, icon } = config[type] || config.info;

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className={`bg-gradient-to-r ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] backdrop-blur-sm`}>
                {icon}
                <span className="font-semibold text-lg">{message}</span>
            </div>
        </div>
    );
}

// ==================== Main Component ====================
export default function StoreDetailPage() {
    const { marketId } = useParams();
    const navigate = useNavigate();

    // State Management
    const [store, setStore] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    
    // Dialog States
    const [showEditStoreDialog, setShowEditStoreDialog] = useState(false);
    const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
    const [showEditFoodDialog, setShowEditFoodDialog] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    
    // Form States
    const [storeForm, setStoreForm] = useState({});
    const [savingStore, setSavingStore] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState(null);

    // ==================== Helper Functions ====================
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ==================== Data Fetching ====================
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
                    is_open: first.is_open,
                    is_manual_override: first.is_manual_override,
                    override_until: first.override_until,
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
            }

            setFoods(foodsArray.filter((f) => f.food_id !== null));
        } catch (err) {
            console.error("โหลดข้อมูลร้านล้มเหลว", err);
            showToast("โหลดข้อมูลร้านล้มเหลว", "error");
        } finally {
            setLoading(false);
        }
    }, [marketId]);

    useEffect(() => {
        fetchFoods();
    }, [fetchFoods]);

    // ==================== Event Handlers ====================
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

            Object.keys(storeForm).forEach(key => {
                if (key === 'shop_logo_file' && storeForm[key]) {
                    formData.append('shop_logo_url', storeForm[key]);
                } else if (key !== 'shop_logo_file' && key !== 'shop_logo_url') {
                    formData.append(key, storeForm[key]);
                }
            });

            await updateMarket(marketId, formData, token);
            await fetchFoods();
            setShowEditStoreDialog(false);
            showToast("✅ อัปเดตร้านค้าสำเร็จ", "success");
        } catch (e) {
            console.error(e);
            showToast("❌ บันทึกข้อมูลร้านค้าไม่สำเร็จ", "error");
        } finally {
            setSavingStore(false);
        }
    };

    const handleToggleAutoMode = async () => {
        const newManualMode = !store.is_manual_override;
        const modeText = newManualMode ? "ปรับเอง" : "อัตโนมัติ";

        if (!window.confirm(`คุณต้องการเปลี่ยนเป็นโหมด${modeText}ใช่หรือไม่?`)) return;

        try {
            const token = localStorage.getItem("token");
            await IsManualMarket(marketId, { is_manual_override: newManualMode }, token);

            setStore(prev => ({
                ...prev,
                is_manual_override: newManualMode
            }));

            showToast(`🎉 เปลี่ยนเป็นโหมด${modeText}สำเร็จ`, "success");
        } catch (err) {
            console.error("Toggle auto mode failed", err);
            showToast(`❌ เปลี่ยนโหมดไม่สำเร็จ`, "error");
            await fetchFoods();
        }
    };

    const handleToggleStoreStatus = async () => {
        if (togglingStatus || !store.is_manual_override) return;

        const newStatus = !store.is_open;
        const actionText = newStatus ? "เปิด" : "ปิด";

        if (!window.confirm(`คุณต้องการ${actionText}ร้านใช่หรือไม่?`)) return;

        try {
            setTogglingStatus(true);
            const token = localStorage.getItem("token");
            await ToggleStoreStatus(marketId, { is_open: newStatus }, token);

            setStore(prev => ({ ...prev, is_open: newStatus }));
            showToast(`🎉 ${actionText}ร้านสำเร็จ`, "success");
        } catch (err) {
            console.error("Toggle store status failed", err);
            showToast(`❌ ${actionText}ร้านไม่สำเร็จ`, "error");
            await fetchFoods();
        } finally {
            setTogglingStatus(false);
        }
    };

    // ==================== Render Helpers ====================
    const renderLoadingState = () => (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 absolute top-0"></div>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">กำลังโหลดข้อมูลร้านค้า...</span>
                </div>
            </div>
        </>
    );

    const renderNoStoreState = () => (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                <div className="text-center">
                    <div className="text-8xl mb-6">🏪</div>
                    <p className="text-gray-600 text-2xl font-semibold">ไม่พบข้อมูลร้านค้า</p>
                </div>
            </div>
        </>
    );

    const renderStatusBadge = () => (
        <div className="flex items-center gap-3">
            {store.is_open ? (
                <div className="bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>ร้านเปิด</span>
                </div>
            ) : (
                <div className="bg-red-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-semibold">
                    <XCircle className="w-5 h-5" />
                    <span>ร้านปิด</span>
                </div>
            )}
        </div>
    );

    const renderStoreControls = () => (
        <div className="absolute top-6 right-6 flex items-center gap-3">
            {/* Auto Mode Switch */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 flex items-center gap-3">
                <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-500 mb-1">โหมดจัดการ</span>
                    <span className={`text-sm font-bold ${!store.is_manual_override ? 'text-blue-600' : 'text-orange-600'}`}>
                        {!store.is_manual_override ? '🤖 อัตโนมัติ' : '🔧 ปรับเอง'}
                    </span>
                </div>
                <button
                    onClick={handleToggleAutoMode}
                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                        !store.is_manual_override ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                        !store.is_manual_override ? 'translate-x-0' : 'translate-x-8'
                    }`}></div>
                </button>
            </div>

            {/* Open/Close Store Button */}
            <button
                onClick={handleToggleStoreStatus}
                disabled={togglingStatus || !store.is_manual_override}
                className={`${
                    !store.is_open ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                } text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2 font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
                title={!store.is_manual_override ? 'เปิดโหมดปรับเองก่อนใช้งาน' : ''}
            >
                <Power className="w-5 h-5" />
                {togglingStatus ? 'กำลังประมวลผล...' : !store.is_open ? 'เปิดร้าน' : 'ปิดร้าน'}
            </button>

            {/* Edit Store Button */}
            <button
                onClick={handleEditStore}
                className="bg-white/95 backdrop-blur-sm text-purple-600 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2 font-semibold"
            >
                <Edit className="w-5 h-5" />
                แก้ไขร้านค้า
            </button>
        </div>
    );

    const renderStoreInfo = () => (
        <div className="p-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {store.shop_name}
            </h1>

            {store.description && (
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">{store.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {store.phone && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-100">
                        <div className="bg-purple-500 p-3 rounded-xl shadow-lg">
                            <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold mb-1">เบอร์โทรศัพท์</p>
                            <p className="text-gray-800 font-bold text-lg">{store.phone}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-5 border-2 border-pink-100">
                    <div className="bg-pink-500 p-3 rounded-xl shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">เวลาเปิด-ปิด</p>
                        <p className="text-gray-800 font-bold text-lg">
                            {store.open_time} - {store.close_time} น.
                        </p>
                    </div>
                </div>

                {store.address && (
                    <div className="flex items-start gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 md:col-span-2 border-2 border-indigo-100">
                        <div className="bg-indigo-500 p-3 rounded-xl shadow-lg">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold mb-1">ที่อยู่</p>
                            <p className="text-gray-800 font-bold text-lg">{store.address}</p>
                        </div>
                    </div>
                )}
            </div>

            {(store.latitude || store.longitude) && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-5 border-2 border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold mb-2">📍 พิกัดที่ตั้ง</p>
                    <p className="text-gray-700 font-mono text-lg font-bold">
                        {store.latitude}, {store.longitude}
                    </p>
                </div>
            )}
        </div>
    );

    const renderFoodItem = (food) => (
        <div
            key={food.food_id}
            onClick={() => handleEditFood(food)}
            className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-purple-100 hover:border-purple-300"
        >
            <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
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
                    <div className="flex items-center justify-center h-full text-gray-300 text-8xl group-hover:scale-110 transition-transform duration-300">
                        🍽️
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 shadow-2xl">
                        <Edit className="w-7 h-7 text-purple-600" />
                    </div>
                </div>

                {/* Status Badge ไว้มุมบนขวาของรูป */}
                <div className="absolute top-3 right-3">
                    {food.is_visible ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                            <CheckCircle className="w-4 h-4" />
                            พร้อมขาย
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                            <XCircle className="w-4 h-4" />
                            ไม่พร้อมขาย
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">
                    {food.food_name}
                </h3>

                {food.category_name && (
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed bg-purple-50 px-3 py-2 rounded-lg font-medium">
                        {food.category_name}
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-purple-600">{food.price}</span>
                        <span className="text-sm text-gray-500 font-semibold">บาท</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-700 text-lg">
                            {food.rating ? Number(food.rating).toFixed(1) : "0.0"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const filteredFoods = foods.filter((food) => {
        if (filterStatus === "visible") return food.is_visible;
        if (filterStatus === "hidden") return !food.is_visible;
        return true;
    });

    // ==================== Main Render ====================
    if (loading) return renderLoadingState();
    if (!store) return renderNoStoreState();

    return (
        <>
            <Navbar />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>กลับ</span>
                        </button>
                        {renderStatusBadge()}
                    </div>

                    {/* Store Details Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-2 border-purple-100">
                        <div className="relative">
                            {store.shop_logo_url && (
                                <div className="relative h-96 overflow-hidden">
                                    <img src={store.shop_logo_url} alt={store.shop_name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                </div>
                            )}
                            {renderStoreControls()}
                        </div>
                        {renderStoreInfo()}
                    </div>

                    {/* Food Menu Section */}
                    <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="text-5xl">🍽️</span>
                                รายการอาหาร
                            </h2>
                            <p className="text-gray-600 mt-2 text-lg">
                                เมนูอาหารทั้งหมด <span className="font-bold text-purple-600">{foods.length}</span> รายการ
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 font-semibold">กรองเมนู:</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                                >
                                    <option value="all">ทั้งหมด ({foods.length})</option>
                                    <option value="visible">พร้อมขาย ({foods.filter(f => f.is_visible).length})</option>
                                    <option value="hidden">ไม่พร้อมขาย ({foods.filter(f => !f.is_visible).length})</option>
                                </select>
                            </div>

                            <button
                                onClick={handleAddFood}
                                className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-3 font-semibold"
                            >
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                                เพิ่มเมนูอาหาร
                            </button>
                        </div>
                    </div>

                    {/* Food Grid */}
                    {filteredFoods.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-xl p-20 text-center border-2 border-purple-100">
                            <div className="text-8xl mb-6">🍽️</div>
                            <p className="text-gray-500 text-2xl mb-4 font-semibold">
                                {foods.length === 0 ? 'ร้านค้ายังไม่มีรายการอาหาร' : 'ไม่พบเมนูอาหารตามเงื่อนไขที่เลือก'}
                            </p>
                            <p className="text-gray-400 text-lg">
                                {foods.length === 0 ? 'คลิกปุ่ม "เพิ่มเมนูอาหาร" เพื่อเริ่มต้น' : 'ลองเปลี่ยนตัวกรองเมนู'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredFoods.map(renderFoodItem)}
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
                marketId={marketId}
                onClose={() => setShowAddFoodDialog(false)}
                onSaved={async () => {
                    await fetchFoods();
                    setShowAddFoodDialog(false);
                    showToast("✅ เพิ่มเมนูอาหารสำเร็จ", "success");
                }}
                onRefresh={fetchFoods}
                showToast={showToast}
            />

            <FoodDialog
                open={showEditFoodDialog}
                isEdit={true}
                selectedFood={selectedFood}
                marketId={marketId}
                onClose={() => setShowEditFoodDialog(false)}
                onSaved={async () => {
                    await fetchFoods();
                    setShowEditFoodDialog(false);
                    showToast("✅ อัปเดตเมนูอาหารสำเร็จ", "success");
                }}
                onRefresh={fetchFoods}
                showToast={showToast}
            />
        </>
    );
}