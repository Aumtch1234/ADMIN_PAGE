import API from './midleware';

// Admin
export const login = (data) => API.post('/login', data);
export const addAdmin = (data, token) =>
  API.post('/add-admin', data, { headers: { Authorization: `Bearer ${token}` }});
export const configAdmin = (data, token) =>
  API.post('/config-admin', data, { headers: { Authorization: `Bearer ${token}` }});
export const getVerifyList = (token) =>
  API.get('/admins/pending', { headers: { Authorization: `Bearer ${token}` }});
export const verifyAdmin = (id, token, role) =>
  API.patch(`/admins/verify/${id}`, { role }, { headers: { Authorization: `Bearer ${token}` }});
export const getAllAdmins = (token) =>
  API.get('/admins/all', { headers: { Authorization: `Bearer ${token}` }});

// Food
export const postFood = (formData, token) =>
  API.post('/addfood', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }});
export const getFoods = () => API.get('/foods');
export const deleteFood = (id, token) =>
  API.delete(`/foods/${id}`, { headers: { Authorization: `Bearer ${token}` }});
export const updateFood = (id, data, token) =>
  API.put(`/foods/${id}`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }});

// Users
export const GetUsers = (token) =>
  API.get('/users', { headers: { Authorization: `Bearer ${token}` }});
