import { useEffect, useState } from "react";
import { X, Save, ImagePlus, Trash2 } from "lucide-react";
import { postFood, updateFood } from "../../APIs/MarketAPI"; // ⬅️ เพิ่ม updateFood
import FoodOptionsEditor from "./FoodOptionsEditor";
import CategoryPicker from "./CategoryPicker";

export default function FoodDialog({ open, isEdit, selectedFood, marketId, onClose, onSaved }) {
  const isOpen = !!open;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = useState({ food_name: "", price: "", image_url: "" });
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imgError, setImgError] = useState("");

  const [options, setOptions] = useState([{ label: "", extraPrice: "" }]);
  const [selectedCatId, setSelectedCatId] = useState(null);

  // --- helpers ---
  const parseOptions = (raw) => {
    let opts = raw ?? [];
    if (typeof opts === "string") {
      try { opts = JSON.parse(opts); } catch { opts = []; }
    }
    if (!Array.isArray(opts)) opts = [];
    return opts.map((o) => ({
      label: o.label ?? o.name ?? o.optionName ?? "", // ✅ ดึงได้ทั้ง label หรือ name
      extraPrice: String(o.extraPrice ?? o.price ?? 0),
    }));
  };


  const parseSingleCategoryId = (food) => {
    // รองรับ category_ids เป็น Array หรือ String (JSON/string of ids)
    if (Array.isArray(food?.category_ids) && food.category_ids.length > 0) return food.category_ids[0];
    if (typeof food?.category_ids === "string" && food.category_ids.trim() !== "") {
      try {
        const arr = JSON.parse(food.category_ids);
        if (Array.isArray(arr) && arr.length) return arr[0];
      } catch {
        // อาจเป็น "3,5" => เอาตัวแรก
        const first = food.category_ids.split(",")[0].trim();
        if (first) return Number(first) || first;
      }
    }
    return food?.category_id ?? null;
  };

  // init / prefill (edit mode)
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && selectedFood) {
      setForm({
        food_name: selectedFood.food_name || "",
        price: selectedFood.price ?? "",
        image_url: selectedFood.image_url || "",
      });

      const mappedOptions = parseOptions(selectedFood.options);
      setOptions(mappedOptions.length ? mappedOptions : [{ label: "", extraPrice: "" }]);

      const presetId = parseSingleCategoryId(selectedFood);
      setSelectedCatId(presetId ?? null);

      // อย่าตั้ง imagePreview จาก URL ตรง ๆ — ใช้จาก form.image_url ใน <img> อยู่แล้ว
      setImageFile(null);
      setImagePreview("");
      setImgError("");
    } else {
      setForm({ food_name: "", price: "", image_url: "" });
      setOptions([{ name: "", extraPrice: "" }]);
      setSelectedCatId(null);
      setImageFile(null);
      setImagePreview("");
      setImgError("");
    }
  }, [isOpen, isEdit, selectedFood]);

  useEffect(() => () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const onPickFile = (file) => {
    setImgError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setImgError("รองรับเฉพาะไฟล์รูปภาพ");
    if (file.size > 5 * 1024 * 1024) return setImgError("ไฟล์ใหญ่เกิน 5MB");
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };
  const onDrop = (e) => { e.preventDefault(); onPickFile(e.dataTransfer.files?.[0]); };
  const onSelectFile = (e) => onPickFile(e.target.files?.[0]);
  const clearImage = () => { setImageFile(null); setImagePreview(""); setImgError(""); };

  const handleClose = () => { if (!saving) onClose?.(); };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (saving) return;

    const name = (form.food_name || "").trim();
    const priceNum = Number(form.price);
    if (!name) return alert("กรุณากรอกชื่อเมนู");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return alert("กรุณากรอกราคาให้ถูกต้อง (> 0)");

    try {
      setSaving(true);

      const normalizedOptions = (options || [])
        .map((o) => ({ label: (o.label || "").trim(), extraPrice: Number(o.extraPrice) || 0 }))
        .filter((o) => o.label);


      const fd = new FormData();
      fd.append("food_name", name);
      fd.append("price", priceNum.toString());
      fd.append("market_id", String(marketId)); // ให้ backend มี context เสมอ
      if (imageFile) fd.append("image", imageFile);
      fd.append("options", JSON.stringify(normalizedOptions));
      if (selectedCatId != null) fd.append("category_id", String(Number(selectedCatId))); // ✅ int เดี่ยว


      let resp;
      if (isEdit && selectedFood?.food_id) {
        // 🔧 โหมดแก้ไข
        resp = await updateFood(selectedFood.food_id, fd, token);
      } else {
        // ➕ โหมดเพิ่ม
        resp = await postFood(fd, token);
      }

      const food = resp?.data?.food ?? resp?.data?.data ?? null;
      onSaved?.(food);
    } catch (err) {
      console.error("เพิ่ม/บันทึกเมนูไม่สำเร็จ:", err);
      alert(err?.response?.data?.message || "เพิ่ม/บันทึกเมนูไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose}></div>
      <form
        onSubmit={handleSave}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800">{isEdit ? "แก้ไขเมนูอาหาร" : "เพิ่มเมนูอาหารใหม่"}</h3>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={saving}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* ชื่อเมนู */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเมนู</label>
            <input
              type="text"
              value={form.food_name}
              onChange={(e) => setForm((s) => ({ ...s, food_name: e.target.value }))}
              placeholder="เช่น ข้าวผัด, ส้มตำ"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* ราคา */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (฿)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* ตัวเลือกเสริม */}
          <FoodOptionsEditor value={options} onChange={setOptions} disabled={saving} />

          {/* อัปโหลดรูปภาพ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">อัปโหลดรูปเมนู</label>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`flex flex-col items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-xl text-center transition-colors ${saving ? "border-gray-200 opacity-70" : "border-gray-300 hover:border-purple-400"}`}
            >
              <ImagePlus className="w-10 h-10 text-gray-400" />
              <p className="text-sm text-gray-600">
                ลากไฟล์มาวางที่นี่ หรือ
                <label className={`mx-1 font-semibold ${saving ? "text-gray-400 cursor-not-allowed" : "text-purple-600 cursor-pointer"}`}>
                  เลือกไฟล์
                  <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} disabled={saving} />
                </label>
              </p>
              <p className="text-xs text-gray-400">รองรับไฟล์ภาพ ขนาดไม่เกิน 5MB</p>
            </div>
            {imgError && <p className="mt-2 text-sm text-red-600">{imgError}</p>}

            {(imagePreview || form.image_url) && (
              <div className="mt-4 relative">
                <img src={imagePreview || form.image_url} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow" title="ลบรูป" disabled={saving}>
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            )}
          </div>

          {/* หมวดหมู่ (เลือกได้ 1 อัน) */}
          <CategoryPicker
            isOpen={isOpen}
            token={token}
            value={selectedCatId}
            onChange={setSelectedCatId}
            disabled={saving}
          />
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            aria-busy={saving}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {isEdit ? "บันทึก" : "เพิ่มเมนู"}
          </button>
        </div>
      </form>
    </div>
  );
}
