import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFoods, postFood, deleteFood, updateFood } from '../services/api';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function FoodListPage() {
    const [foods, setFoods] = useState([]);
    const [form, setForm] = useState({ foodName: '', shopName: '', price: '', image: null });
    const [editingFood, setEditingFood] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await getFoods();
            setFoods(res.data);
        } catch (err) {
            console.error('Error fetching foods:', err);
        }
    };

    const openAddDialog = () => {
        setEditingFood(null);
        setForm({ foodName: '', shopName: '', price: '', image: null });
        setImagePreview(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (food) => {
        setEditingFood(food);
        setForm({
            foodName: food.food_name,
            shopName: food.shop_name,
            price: food.price,
            image: null,
        });
        setImagePreview(food.image_url); // แสดงรูปเก่า
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingFood(null);
        setForm({ foodName: '', shopName: '', price: '', image: null });
        setImagePreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm((prev) => ({ ...prev, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            // ถ้าลบไฟล์ที่เลือกออก ให้กลับไปโชว์รูปเก่า (ถ้ามี)
            if (editingFood) setImagePreview(editingFood.image_url);
            else setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingFood && !form.image) {
            alert('กรุณาเลือกรูปอาหาร');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('foodName', form.foodName);
            formData.append('shopName', form.shopName);
            formData.append('price', form.price);
            if (form.image) formData.append('image', form.image);

            if (editingFood) {
                await updateFood(editingFood.id, formData, token);
                alert('อัปเดตเมนูเรียบร้อยแล้ว');
            } else {
                await postFood(formData, token);
                alert('เพิ่มเมนูสำเร็จ');
            }
            fetchFoods();
            handleCloseDialog();
        } catch (err) {
            alert('เกิดข้อผิดพลาด');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจว่าต้องการลบเมนูนี้?')) return;
        try {
            const token = localStorage.getItem('token');
            await deleteFood(id, token);
            alert('ลบเมนูเรียบร้อยแล้ว');
            fetchFoods();
        } catch (err) {
            alert('ลบเมนูไม่สำเร็จ');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-amber-700">รายการเมนูอาหาร</h1>
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={openAddDialog}
                    >
                        เพิ่มเมนู
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-amber-100 text-amber-800">
                            <tr>
                                <th className="px-4 py-3 text-left">รูป</th>
                                <th className="px-4 py-3 text-left">ชื่อเมนู</th>
                                <th className="px-4 py-3 text-left">ร้าน</th>
                                <th className="px-4 py-3 text-left">ราคา (บาท)</th>
                                <th className="px-4 py-3 text-left">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {foods.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-500">
                                        ไม่มีเมนูในระบบ
                                    </td>
                                </tr>
                            ) : (
                                foods.map((food) => (
                                    <tr key={food.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <Zoom>
                                                <img
                                                    src={food.image_url}
                                                    alt={food.food_name}
                                                    className="w-20 h-20 object-cover rounded cursor-zoom-in"
                                                />
                                            </Zoom>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{food.food_name}</td>
                                        <td className="px-4 py-3">{food.shop_name}</td>
                                        <td className="px-4 py-3">{Number(food.price).toFixed(2)}</td>
                                        <td className="px-4 py-3 space-x-2">
                                            <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                                onClick={() => openEditDialog(food)}
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                                onClick={() => handleDelete(food.id)}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialog */}
            {isDialogOpen && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50"
                    onClick={handleCloseDialog}
                >
                    <div
                        className="bg-white rounded p-6 w-96 relative max-h-[90vh] overflow-y-auto shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded">
                                <svg
                                    className="animate-spin h-6 w-6 text-green-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 010 16v4l-3.5-3.5L12 20v-4a8 8 0 01-8-8z"
                                    ></path>
                                </svg>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-4">
                            {editingFood ? 'แก้ไขเมนู' : 'เพิ่มเมนู'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="foodName"
                                placeholder="ชื่อเมนู"
                                className="border p-2 w-full rounded"
                                value={form.foodName}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                            <input
                                type="text"
                                name="shopName"
                                placeholder="ชื่อร้าน"
                                className="border p-2 w-full rounded"
                                value={form.shopName}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                            <input
                                type="number"
                                name="price"
                                placeholder="ราคา"
                                className="border p-2 w-full rounded"
                                value={form.price}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="border p-2 w-full rounded"
                                disabled={loading}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-1">ตัวอย่างรูป:</p>
                                    <Zoom>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded border cursor-zoom-in"
                                        />
                                    </Zoom>
                                </div>
                            )}
                            <div className="flex justify-between mt-4">
                                <button
                                    type="submit"
                                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? (editingFood ? 'กำลังอัปเดต...' : 'กำลังเพิ่ม...') : editingFood ? 'อัปเดตเมนู' : 'เพิ่มเมนู'}
                                </button>
                                <button
                                    type="button"
                                    className="text-red-500 underline"
                                    onClick={handleCloseDialog}
                                    disabled={loading}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
