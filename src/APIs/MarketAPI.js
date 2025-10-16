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


export const postCategory = (formData, token) =>
  API.post('/addcategory', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

export const getCategories = (token) =>
  API.get('/getcategories', {
    headers: { Authorization: `Bearer ${token}` }
  });

export const postFood = (formData, token) =>
  API.post('/addfood', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
// ✅ แก้ไข: Toggle สถานะเปิด/ปิดร้าน (ต้องอยู่ในโหมด Manual)
export const ToggleStoreStatus = (marketId, data, token) =>
  API.put(`/markets/${marketId}/toggle-status`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

// ✅ แก้ไข: เปลี่ยนโหมด Auto/Manual
export const IsManualMarket = (marketId, data, token) =>
  API.put(`/markets/${marketId}/manual-override`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

export const postShop = (formData, token) =>
  API.post('/addmarket', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

// ดึงร้านค้าทั้งหมด
export const getAllStores = (token) =>
  API.get('/markets/all', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getFoodsWithMarket = (marketId, token) =>
  API.get(`/foods/market/${marketId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ แก้ไข: เปิด/ปิดการแสดงเมนูอาหาร
export const toggleFoodVisibility = (foodId, data, token) =>
  API.put(`/foods/${foodId}/visibility`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });


// ดึงร้านค้าแอดทั้งหมด
export const getAllMarketsAdmin = async (token) => {
  return API.get('/admin/markets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateFood = (foodId, formData, token) =>
  API.patch(`/food/${foodId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

export const updateMarket = (marketId, formData, token) =>
  API.patch(`/market/${marketId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });


// ลบเมนู
export const deleteFood = (foodId, token) =>
  API.delete(`/food/${foodId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });