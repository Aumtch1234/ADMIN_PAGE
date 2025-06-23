import { useState } from 'react';
import Navbar from '../components/Navbar';
import { postFood } from '../services/api';

export default function PostfoodPage() {
  const [form, setForm] = useState({
    foodName: '',
    shopName: '',
    price: '',
    image: null,
  });
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert('กรุณาเลือกรูปอาหาร');

    const data = new FormData();
    data.append('foodName', form.foodName);
    data.append('shopName', form.shopName);
    data.append('price', form.price);
    data.append('image', form.image);

    try {
      setLoading(true); // ✅ เริ่มโหลด
      const token = localStorage.getItem('token');
      await postFood(data, token);
      alert('เพิ่มเมนูสำเร็จแล้ว');
      setForm({ foodName: '', shopName: '', price: '', image: null });
      window.location.href = '/foods'; // ✅ ไปที่หน้ารายการเมนู
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false); // ✅ หยุดโหลดไม่ว่า success หรือ error
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow w-96 space-y-4 relative"
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

          <h2 className="text-xl font-bold text-center">เพิ่มเมนูอาหาร</h2>
          <input
            type="text"
            name="foodName"
            placeholder="ชื่อเมนู"
            className="border p-2 w-full rounded"
            value={form.foodName}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="text"
            name="shopName"
            placeholder="ชื่อร้าน"
            className="border p-2 w-full rounded"
            value={form.shopName}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="number"
            name="price"
            placeholder="ราคา"
            className="border p-2 w-full rounded"
            value={form.price}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 w-full rounded"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกเมนู'}
          </button>
        </form>
      </div>
    </div>
  );
}
