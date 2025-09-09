import API, { getAuthHeader } from './midleware';

// ดูรายการไรเดอร์ที่รอการอนุมัติ (paginated)
export const getPendingRiders = (page = 1, limit = 10) =>
  API.get('/riders/pending', { params: { page, limit }, headers: getAuthHeader() });

// ดูรายละเอียดไรเดอร์
export const getRiderDetails = (riderId) =>
  API.get(`/riders/${riderId}`, { headers: getAuthHeader() });

// อนุมัติไรเดอร์
export const approveRider = (riderId, adminId) =>
  API.patch(`/riders/${riderId}/approve`, { admin_id: adminId }, { headers: getAuthHeader() });

// ปฏิเสธไรเดอร์
export const rejectRider = (riderId, adminId, reason) =>
  API.patch(`/riders/${riderId}/reject`, { admin_id: adminId, reason }, { headers: getAuthHeader() });

// ดูรายการไรเดอร์ทั้งหมด (filterable)
export const getAllRiders = (opts = {}) =>
  API.get('/riders/all', { params: opts, headers: getAuthHeader() });

export default {
  getPendingRiders,
  getRiderDetails,
  approveRider,
  rejectRider,
  getAllRiders,
};