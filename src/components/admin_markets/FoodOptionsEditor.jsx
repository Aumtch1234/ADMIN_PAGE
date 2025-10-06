import { Plus, Trash2 } from "lucide-react";

export default function FoodOptionsEditor({ value = [], onChange, disabled }) {
  const addRow = () => onChange?.([...(value || []), { name: "", extraPrice: "" }]);
  const removeRow = (idx) => onChange?.((value || []).filter((_, i) => i !== idx));
  const updateRow = (idx, key, v) =>
    onChange?.((value || []).map((row, i) => (i === idx ? { ...row, [key]: v } : row)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">ตัวเลือกเสริม (Options)</label>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
          disabled={disabled}
        >
          <Plus className="w-4 h-4" />
          เพิ่มตัวเลือก
        </button>
      </div>

      {(value || []).length === 0 ? (
        <div className="text-sm text-gray-400">ยังไม่มีตัวเลือกเสริม — คลิก “เพิ่มตัวเลือก”</div>
      ) : (
        <div className="space-y-2">
          {(value || []).map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7">
                <input
                  type="text"
                  placeholder="เช่น เพิ่มชีส, ไข่ดาว"
                  value={row.name}
                  onChange={(e) => updateRow(idx, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={disabled}
                />
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">+฿</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={row.extraPrice}
                    onChange={(e) => updateRow(idx, "extraPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-60"
                  title="ลบตัวเลือก"
                  disabled={disabled}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">
        ตัวอย่าง: “เพิ่มชีส” +10, “ไข่ดาว” +7 — ระบบจะคำนวณราคาขาย (sell_options) ให้อัตโนมัติ
      </p>
    </div>
  );
}
