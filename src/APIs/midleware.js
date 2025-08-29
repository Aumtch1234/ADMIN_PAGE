// axiosClient.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/admin', // Base URL ของ admin
});

// Interceptor ตรวจจับ 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันช่วยสร้าง headers พร้อม token
export const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default API;
