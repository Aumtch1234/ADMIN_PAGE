import { useState } from 'react';
import { addAdmin } from '../APIs/API';
import Navbar from '../components/Navbar';
import { UserPlus, Lock, User, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';

export default function AddAdminPage() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem('token');

  // ✅ validateForm()
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!form.username || form.username.trim() === "") {
      newErrors.username = "กรุณาใส่ชื่อผู้ใช้";
    } else if (form.username.length < 3) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
    } else if (/\s/.test(form.username)) {
      newErrors.username = "ชื่อผู้ใช้ห้ามมีช่องว่าง";
    }

    // Password validation
    if (!form.password || form.password.trim() === "") {
      newErrors.password = "กรุณาใส่รหัสผ่าน";
    } else if (form.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      newErrors.password = "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (เช่น !@#$%)";
    }

    // ✅ Confirm Password validation (แก้ให้แยกออกมา)
    if (!form.confirmPassword || form.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await addAdmin(form, token);
      setMessage('เพิ่ม Admin สำเร็จ! กำลังนำทางไปยังหน้ารายการ...');
      setMessageType('success');

      // Show success animation before redirect
      setTimeout(() => {
        window.location.href = '/pending-admin';
      }, 2000);
    } catch (error) {
      setMessage('ไม่สามารถเพิ่ม Admin ได้ กรุณาลองใหม่อีกครั้ง');
      setMessageType('error');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // ตรวจทันทีเมื่อพิมพ์
    const fieldError = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  // ✅ validateField()
  const validateField = (field, value) => {
    if (field === "username") {
      if (!value || value.trim() === "") return "กรุณาใส่ชื่อผู้ใช้";
      if (value.length < 6) return "ชื่อผู้ใช้ต้องมีอย่างน้อย 6 ตัวอักษร";
      if (/\s/.test(value)) return "ชื่อผู้ใช้ห้ามมีช่องว่าง";
      if (!/^[a-zA-Z0-9_.-]+$/.test(value))
        return "ชื่อผู้ใช้สามารถประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น";
    }

    if (field === "password") {
      if (!value || value.trim() === "") return "กรุณาใส่รหัสผ่าน";
      if (value.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      if (!/[A-Z]/.test(value)) return "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
      if (!/[a-z]/.test(value)) return "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
      if (!/[0-9]/.test(value)) return "ต้องมีตัวเลขอย่างน้อย 1 ตัว";
      if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value))
        return "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (เช่น !@#$%)";
    }

    // ✅ เพิ่มส่วนนี้แยกออกมา
    if (field === "confirmPassword") {
      if (!value || value.trim() === "") return "กรุณายืนยันรหัสผ่าน";
      if (value !== form.password) return "รหัสผ่านไม่ตรงกัน";
    }

    return null;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="w-full max-w-md">
          {/* Decorative Elements */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg transform skew-y-0 -rotate-6 rounded-3xl opacity-20 blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 shadow-lg transform skew-y-0 rotate-6 rounded-3xl opacity-20 blur-xl"></div>
          </div>

          {/* Main Form Card */}
          <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <UserPlus className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center mb-2">เพิ่ม Admin ใหม่</h2>
              <p className="text-center text-white/80 text-sm">กรอกข้อมูลด้านล่างเพื่อสร้างบัญชี Admin</p>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-6">
              {/* Username Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 transition-all duration-200 ${errors.username
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-blue-400 hover:border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400/20`}
                  disabled={isLoading}
                />
                {/* ✅ ไอคอนด้านขวา */}
                {errors.username ? (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                ) : form.username ? (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : null}
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.username}
                </p>
              )}


              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200 ${errors.password
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-blue-400 hover:border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400/20`}
                  disabled={isLoading}
                />
                {/* ✅ ไอคอนด้านขวา */}
                {errors.password ? (
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                ) : form.password ? (
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.password}
                </p>
              )}

              {/* Confirm Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200 ${errors.confirmPassword
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-blue-400 hover:border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400/20`}
                  disabled={isLoading}
                />

                {/* ✅ ไอคอนด้านขวา */}
                {errors.confirmPassword ? (
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                ) : form.confirmPassword ? (
                  <div className="absolute inset-y-0 right-8 flex items-center pr-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                </p>
              )}

              {/* Message Alert */}
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-pulse
                  ${messageType === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {messageType === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message}
                  </span>
                </div>
              )}

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-900 font-medium mb-1">คำแนะนำด้านความปลอดภัย</p>
                    <ul className="text-blue-700 space-y-0.5">
                      <li>• ใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร</li>
                      <li>• ผสมตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข</li>
                      <li>• หลีกเลี่ยงการใช้ข้อมูลส่วนตัวในรหัสผ่าน</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !form.username || !form.password}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform
                    ${isLoading || !form.username || !form.password
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังเพิ่ม Admin...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      เพิ่ม Admin
                    </span>
                  )}
                </button>

                <a
                  href="../"
                  className="w-full py-3 px-4 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  กลับหน้าหลัก
                </a>
              </div>
            </div>
          </div>

          {/* Decorative Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Admin Management System</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}