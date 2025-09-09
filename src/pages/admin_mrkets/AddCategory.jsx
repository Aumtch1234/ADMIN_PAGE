import { useState } from "react";
import { postCategory } from "../../APIs/MarketAPI";

export default function AddCategory() {
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // TODO: ดึง token มาจาก localStorage หรือ context
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await postCategory({ category_name: categoryName }, token);
            const data = res.data; // axios จะ parse JSON ให้อัตโนมัติ

            setMessage("✅ " + data.message);
            setCategoryName(""); // clear input
        } catch (err) {
            console.error("Error:", err);
            setMessage("❌ " + (err.response?.data?.message || "Server error"));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-md mx-auto p-6">
            <div className="bg-white shadow-md rounded-xl p-6">
                <h1 className="text-2xl font-bold mb-4">เพิ่มหมวดหมู่สินค้า</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium mb-1">
                            ชื่อหมวดหมู่
                        </label>
                        <input
                            id="categoryName"
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="เช่น อาหาร, เครื่องดื่ม"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center font-medium">{message}</p>
                )}
            </div>
        </div>
    );
}
