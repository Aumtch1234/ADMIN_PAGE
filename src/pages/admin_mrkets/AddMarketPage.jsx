import { useState } from "react";
import Navbar from "../../components/Navbar";
import { postShop } from "../../APIs/MarketAPI";
import { useLoadScript } from "@react-google-maps/api";
import MapWithAdvancedMarker from "./AdvancedMarkerElement";
import PlaceAutocompleteElement from "../admin_mrkets/PlaceAutocomplete";

const libraries = ["places", "marker"]; // ✅ marker สำหรับ AdvancedMarkerElement

export default function AddMarketPage() {
  const [form, setForm] = useState({
    shop_name: "",
    shop_description: "",
    phone: "",
    address: "",
    open_time: "",
    close_time: "",
    latitude: 13.736717, // default กทม.
    longitude: 100.523186,
    shop_logo_url: null,
  });

  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
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

  if (!isLoaded) return <div>กำลังโหลดแผนที่...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">➕ เพิ่มร้านค้าใหม่</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* input เดิมๆ */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">ชื่อร้าน</label>
              <input
                type="text"
                name="shop_name"
                value={form.shop_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">คำอธิบายร้าน</label>
              <textarea
                name="shop_description"
                value={form.shop_description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">โลโก้ร้าน (อัปโหลด)</label>
              <input
                type="file"
                name="shop_logo_url"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* ข้อมูลติดต่อ */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">เบอร์โทร</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">ที่อยู่</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* เวลาเปิดปิด */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">เวลาเปิด</label>
                <input
                  type="time"
                  name="open_time"
                  value={form.open_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700 font-medium">เวลาปิด</label>
                <input
                  type="time"
                  name="close_time"
                  value={form.close_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ✅ กล่องค้นหา (Place Autocomplete) */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">ค้นหาตำแหน่งร้าน</label>
              <PlaceAutocompleteElement
                className="w-full"
                options={{
                  // ตัวอย่างกำหนด bias/limit
                  // includedRegionCodes: ['th'],
                  // includedPrimaryTypes: ['establishment'],
                  // locationBias: { radius: 5000, center: { lat: form.latitude, lng: form.longitude } },
                }}
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

            {/* แผนที่ + ปักหมุด (AdvancedMarkerElement) */}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">ตำแหน่งบนแผนที่</label>
              <div className="h-64 w-full rounded-lg overflow-hidden">
                <MapWithAdvancedMarker
                  lat={form.latitude}
                  lng={form.longitude}
                  onPositionChange={({ lat, lng }) =>
                    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                  }
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Lat: {form.latitude}, Lng: {form.longitude}
              </p>
            </div>

            {/* ปุ่มบันทึกเหมือนเดิม */}
            <div className="sticky bottom-0 bg-white py-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                {loading ? "⏳ กำลังสร้าง..." : "✅ สร้างร้านค้า"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
