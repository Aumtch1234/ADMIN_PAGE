import { useState } from "react";
import Navbar from "../../components/Navbar";
import { postShop } from "../../APIs/MarketAPI";
import { useLoadScript } from "@react-google-maps/api";
import MapWithAdvancedMarker from "./AdvancedMarkerElement";
import PlaceAutocompleteElement from "../admin_markets/PlaceAutocomplete";
import { MapPin, Clock, Phone, MapPinned, Image, FileText, Search } from "lucide-react";

const libraries = ["places", "marker"];

export default function AddMarketPage() {
  const [form, setForm] = useState({
    shop_name: "",
    shop_description: "",
    phone: "",
    address: "",
    open_time: "",
    close_time: "",
    latitude: 17.291445,
    longitude: 104.112924,
    shop_logo_url: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm({ ...form, [name]: files[0] });
      // สร้าง preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await postShop(formData, token);
      alert("✅ เพิ่มร้านค้าเรียบร้อยแล้ว");
      window.location.href = "/foods";
    } catch (err) {
      console.error("Error creating shop:", err);
      alert("❌ ไม่สามารถเพิ่มร้านค้าได้");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = ({ lat, lng }) => {
    setForm((prev) => ({ 
      ...prev, 
      latitude: lat, 
      longitude: lng 
    }));
  };

  if (!isLoaded) return <div>กำลังโหลดแผนที่...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <MapPinned className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            เพิ่มร้านค้าใหม่
          </h1>
          <p className="text-gray-600">กรอกข้อมูลร้านค้าของคุณให้ครบถ้วน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ฝั่งซ้าย - ข้อมูลทั่วไป */}
            <div className="space-y-6">
              {/* ข้อมูลพื้นฐาน */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  ข้อมูลพื้นฐาน
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">ชื่อร้าน *</label>
                    <input
                      type="text"
                      name="shop_name"
                      value={form.shop_name}
                      onChange={handleChange}
                      placeholder="เช่น ร้านกาแฟดอยช้าง"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">คำอธิบายร้าน</label>
                    <textarea
                      name="shop_description"
                      value={form.shop_description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="บอกเล่าเกี่ยวกับร้านของคุณ..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      โลโก้ร้าน
                    </label>
                    <div className="flex items-center gap-4">
                      {previewImage && (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center hover:border-blue-500 transition-colors">
                          <span className="text-sm text-gray-600">
                            {form.shop_logo_url ? form.shop_logo_url.name : "เลือกไฟล์รูปภาพ"}
                          </span>
                        </div>
                        <input
                          type="file"
                          name="shop_logo_url"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลติดต่อ */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-500" />
                  ข้อมูลติดต่อ
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">เบอร์โทร</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0XX-XXX-XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">ที่อยู่</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="ที่อยู่ร้านค้า"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* เวลาทำการ */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  เวลาทำการ
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">เวลาเปิด</label>
                    <input
                      type="time"
                      name="open_time"
                      value={form.open_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">เวลาปิด</label>
                    <input
                      type="time"
                      name="close_time"
                      value={form.close_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา - แผนที่ */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  ตำแหน่งร้านค้า
                </h2>

                {/* ค้นหาสถานที่ */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    ค้นหาตำแหน่ง
                  </label>
                  <PlaceAutocompleteElement
                    className="w-full"
                    options={{}}
                    onSelect={({ lat, lng, address }) => {
                      setForm((prev) => ({
                        ...prev,
                        address: address || prev.address,
                        latitude: lat,
                        longitude: lng,
                      }));
                    }}
                  />
                </div>

                {/* แผนที่ */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    🖱️ คลิกบนแผนที่เพื่อปักหมุด (ไม่ต้องลาก)
                  </label>
                  <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner relative">
                    <MapWithAdvancedMarker
                      lat={form.latitude}
                      lng={form.longitude}
                      onMapClick={handleMapClick}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* พิกัด */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">พิกัดที่เลือก</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Latitude</div>
                      <div className="font-mono text-sm font-semibold text-gray-800">
                        {form.latitude.toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Longitude</div>
                      <div className="font-mono text-sm font-semibold text-gray-800">
                        {form.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="sticky bottom-4 z-10">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังสร้างร้านค้า...
                  </>
                ) : (
                  <>
                    <MapPinned className="w-5 h-5" />
                    สร้างร้านค้า
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}