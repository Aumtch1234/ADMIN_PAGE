"use client";
import { useState } from "react";
import { Upload, Package, X, Check, AlertCircle, Image } from "lucide-react";
import { postCategory } from "../../APIs/MarketAPI"; // ✅ ต้องมี

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // ✅ preview
  const [isDragging, setIsDragging] = useState(false); // ✅ drag state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // ✅ success/error

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("category_name", categoryName);
      if (image) {
        formData.append("image", image);
      }

      const res = await postCategory(formData, token);
      const data = res.data;

      setMessage("✅ " + data.message);
      setMessageType("success");
      setCategoryName("");
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ " + (err.response?.data?.message || "Server error"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            เพิ่มหมวดหมู่สินค้า
          </h1>
          <p className="text-gray-600 mt-2">สร้างหมวดหมู่ใหม่สำหรับสินค้าของคุณ</p>
        </div>

        {/* Main Card */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-3xl">
          <div className="space-y-6">
            {/* Category Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                ชื่อหมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="เช่น อาหาร, เครื่องดื่ม, ของใช้"
                  className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  required
                />
                <Package className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รูปหมวดหมู่ <span className="text-red-500">*</span>
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? "border-purple-500 bg-purple-50 scale-105"
                      : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:bg-opacity-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">
                        คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        รองรับไฟล์ JPG, PNG, GIF (ไม่เกิน 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-1">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    รูปพร้อมแล้ว
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !categoryName}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                loading || !categoryName
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  บันทึกหมวดหมู่
                </span>
              )}
            </button>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {messageType === "success" ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <p
                className={`font-medium ${
                  messageType === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <span className="text-lg">💡</span>
            <span>คำแนะนำ: ใช้รูปภาพที่มีขนาด 1:1 เพื่อการแสดงผลที่ดีที่สุด</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
