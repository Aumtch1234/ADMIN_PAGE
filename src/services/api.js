import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// เพิ่ม interceptor ตรวจจับ 401 (Unauthorized) token หมดอายุ
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      localStorage.removeItem('token');
      window.location.href = '/login'; // รีไดเร็กไปหน้า login
    }
    return Promise.reject(error);
  }
);

// ✅ login ถูกต้อง
export const login = (data) => API.post('/login', data);

// ✅ add admin พร้อมแนบ token
export const addAdmin = (data, token) =>
  API.post('/add-admin', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const configAdmin = (data, token) =>
  API.post('/config-admin', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ แก้เป็น GET '/admins/pending'
export const getVerifyList = (token) =>
  API.get('/admins/pending', {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ เพิ่มฟังก์ชันสำหรับกดยืนยัน admin
export const verifyAdmin = (id, token, role, verify) => {
  const body = {};
  if (role !== undefined) body.role = role;
  if (verify !== undefined) body.verify = verify;

  return API.patch(`/admins/verify/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllAdmins = (token) =>
  API.get('/admins/all', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const postFood = (formData, token) =>
  API.post('/addfood', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // จำเป็นสำหรับส่งไฟล์
    },
  });

// 📋 ดึงเมนูทั้งหมด
export const getFoods = () => API.get('/foods');

export const deleteFood = (id, token) =>
  API.delete(`/foods/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  export const updateFood = (id, data, token) =>
  API.put(`/foods/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
