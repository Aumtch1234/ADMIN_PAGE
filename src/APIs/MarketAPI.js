import API from './midleware';

// อนุมัติร้านค้า
export const approveStore = (id, token) =>
  API.patch(`/market/verify/${id}`, { role: 'approved' }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ปฏิเสธร้านค้า
export const rejectStore = (id, token) =>
  API.patch(`/market/verify/${id}`, { role: 'rejected' }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ดึงร้านค้าทั้งหมด
export const getAllStores = (token) =>
  API.get('/markets/all', {
    headers: { Authorization: `Bearer ${token}` },
  });
