import { X, Save, MapPin, Search, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import MapWithAdvancedMarker from "../../pages/admin_mrkets/AdvancedMarkerElement";
import PlaceAutocompleteElement from "../../pages/admin_mrkets/PlaceAutocomplete";

const libraries = ["places", "marker"];

export default function StoreEditDialog({ open, value, onChange, onClose, onSave, saving }) {
  const [previewImage, setPreviewImage] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // รีเซ็ต preview เมื่อเปิด dialog
  useEffect(() => {
    if (open) {
      setPreviewImage(null);
    }
  }, [open]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      onChange({ ...value, shop_logo_file: file });
    }
  };

  const handleMapClick = ({ lat, lng }) => {
    onChange({ 
      ...value, 
      latitude: lat.toString(), 
      longitude: lng.toString() 
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลร้านค้า</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* คอลัมน์ซ้าย - ข้อมูลทั่วไป */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้าน</label>
                <input
                  type="text"
                  value={value.shop_name || ""}
                  onChange={(e) => onChange({ ...value, shop_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <textarea
                  value={value.description || ""}
                  onChange={(e) => onChange({ ...value, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  โลโก้ร้าน
                </label>
                <div className="flex items-center gap-4">
                  {(previewImage || value.shop_logo_url) && (
                    <img 
                      src={previewImage || value.shop_logo_url} 
                      alt="Logo" 
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                    />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center hover:border-purple-500 transition-colors">
                      <span className="text-sm text-gray-600">
                        {value.shop_logo_file ? value.shop_logo_file.name : "เลือกไฟล์ใหม่"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={value.phone || ""}
                  onChange={(e) => onChange({ ...value, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เวลาเปิด</label>
                  <input
                    type="time"
                    value={value.open_time || ""}
                    onChange={(e) => onChange({ ...value, open_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เวลาปิด</label>
                  <input
                    type="time"
                    value={value.close_time || ""}
                    onChange={(e) => onChange({ ...value, close_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                <textarea
                  value={value.address || ""}
                  onChange={(e) => onChange({ ...value, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={saving}
                />
              </div>
            </div>

            {/* คอลัมน์ขวา - แผนที่ */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  ค้นหาตำแหน่ง
                </label>
                {isLoaded && (
                  <PlaceAutocompleteElement
                    className="w-full"
                    options={{}}
                    onSelect={({ lat, lng, address }) => {
                      onChange({
                        ...value,
                        address: address || value.address,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      });
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  คลิกบนแผนที่เพื่อปักหมุด
                </label>
                <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                  {isLoaded ? (
                    <MapWithAdvancedMarker
                      lat={parseFloat(value.latitude) || 13.736717}
                      lng={parseFloat(value.longitude) || 100.523186}
                      onMapClick={handleMapClick}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      กำลังโหลดแผนที่...
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="text-sm font-medium text-gray-700 mb-2">พิกัดที่เลือก</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Latitude</div>
                    <div className="font-mono text-sm font-semibold text-gray-800">
                      {parseFloat(value.latitude || 0).toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Longitude</div>
                    <div className="font-mono text-sm font-semibold text-gray-800">
                      {parseFloat(value.longitude || 0).toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            disabled={saving}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}