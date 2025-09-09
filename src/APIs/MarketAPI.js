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

// ดึงร้านค้าแอดทั้งหมด
export const getAllMarketsAdmin = async (token) => {
  return API.get('/admin/markets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};