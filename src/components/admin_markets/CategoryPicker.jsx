import { useEffect, useMemo, useState } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import { getCategories } from "../../APIs/MarketAPI";

export default function CategoryPicker({ isOpen, token, value, onChange, disabled }) {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");

  // ค่าที่เลือกปัจจุบัน
  const selectedId = value != null ? Number(value) : null;
  const sid = selectedId != null ? String(selectedId) : null;

  // เก็บ "ค่าก่อนแก้ไข" (ครั้งแรกที่มี value หลังเปิด)
  const [initialId, setInitialId] = useState(null);

  // รีเซ็ต initial ตอนปิด modal เพื่อรองรับการแก้ไขรายการอื่นรอบต่อไป
  useEffect(() => {
    if (!isOpen) {
      setInitialId(null);
      setLoaded(false);
      setCategories([]);
      setQ("");
    }
  }, [isOpen]);

  // จับค่าก่อนแก้ไขครั้งแรก
  useEffect(() => {
    if (isOpen && initialId == null && value != null) {
      setInitialId(Number(value));
    }
  }, [isOpen, value, initialId]);

  // โหลดหมวดหมู่
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const { data } = await getCategories(token);
        const raw = Array.isArray(data) ? data : data?.categories || [];
        const list = raw
          .map((c) => ({
            id: c.id ?? c.category_id ?? c.cate_id ?? c.cat_id,
            name: c.name ?? c.category_name ?? c.cate_name ?? c.title,
            cate_image_url: c.cate_image_url ?? c.image_url ?? c.icon_url ?? c.cover_url ?? "",
          }))
          .filter((c) => c.id != null);
        setCategories(list);
      } catch (e) {
        console.error("โหลดหมวดหมู่ไม่สำเร็จ:", e);
        setCategories([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [isOpen, token]);

  // ถ้าค่าปัจจุบันไม่อยู่ในลิสต์ เคลียร์เฉพาะหลังโหลดเสร็จ (กันค่าหลอนจากการโหลดช้า)
  useEffect(() => {
    if (!loaded || !sid) return;
    const exists = categories.some((c) => String(c.id) === sid);
    if (!exists) onChange?.(null);
  }, [loaded, categories, sid, onChange]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return categories.filter((c) => (c?.name || "").toLowerCase().includes(ql));
  }, [categories, q]);

  const toggle = (id) => {
    const n = Number(id);
    if (selectedId === n) onChange?.(null);
    else onChange?.(n);
  };

  const selected = useMemo(
    () => categories.find((c) => Number(c.id) === selectedId) || null,
    [categories, selectedId]
  );

  const original = useMemo(
    () => categories.find((c) => Number(c.id) === Number(initialId)) || null,
    [categories, initialId]
  );

  // กด X = คืนค่าเดิม (ถ้าไม่มีค่าเดิม จะล้าง)
  const resetToOriginal = () => {
    if (initialId != null) onChange?.(Number(initialId));
    else onChange?.(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาหมวดหมู่..."
          className="ml-auto w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={disabled}
        />
      </div>

      {/* แถวแสดงค่าเดิม/ค่าปัจจุบัน */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {original && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs">
            ก่อนแก้ไข: <b>{original.name}</b> (#{original.id})
            {selectedId !== Number(initialId) && (
              <button
                type="button"
                onClick={() => onChange?.(Number(initialId))}
                className="ml-1 hover:text-gray-900"
                disabled={disabled}
                title="คืนค่าเดิม"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        )}

        {selected && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs">
            กำลังเลือก: <b>{selected.name}</b> (#{selected.id})
            <button
              type="button"
              onClick={resetToOriginal} // <- เปลี่ยนจากล้างค่า เป็นคืนค่าเดิม
              className="ml-1 hover:text-purple-900"
              disabled={disabled}
              title={initialId != null ? "คืนค่าเดิม" : "ล้างค่า"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">{loaded ? "ไม่พบหมวดหมู่ที่ค้นหา" : "กำลังโหลด..."}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((c) => {
            const active = selectedId === Number(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`group relative flex items-center gap-2 p-2 rounded-xl border transition ${active ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200 hover:border-gray-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={disabled}
                aria-pressed={active}
              >
                <img
                  src={c.cate_image_url}
                  alt={c.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.style.opacity = 0)}
                />
                <span className="text-sm text-gray-700">{c.name}</span>
                {active && (
                  <span className="ml-auto">
                    <Check className="w-4 h-4 text-purple-600" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
