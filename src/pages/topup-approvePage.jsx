import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Users, Eye, RefreshCw, AlertCircle, X } from 'lucide-react';
import Navbar from "../components/Navbar";
import {
  TopUpsAll,
  TopUpsPending,
  TopUpsApproved,
  TopUpsRejected,
  ApproveTopUp,
  RejectTopUp,
  TopUpStatistics
} from '../APIs/TopUpAPI';

export default function TopUpApprovePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [topups, setTopups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ไม่มี UI toggle แต่ต้องมี state เพื่อให้ตัวกรองไม่พัง
  const [onlyToday] = useState(false);

  const token = localStorage.getItem('token');

  // ---------- Helpers ----------
  const formatBaht = (value) => {
    const n = typeof value === 'number'
      ? value
      : Number(String(value ?? '').replace(/,/g, ''));
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };

  const parseDate = (v) => {
    if (!v) return null;
    // ให้ new Date อ่านได้เสมอ (กันเคส "YYYY-MM-DD HH:mm:ss")
    const s = String(v).includes('T') ? String(v) : String(v).replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };

  const isToday = (v) => {
    const d = parseDate(v);
    if (!d) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // ---------- Fetchers ----------
  const fetchTopups = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let response;

      switch (tab) {
        case 'pending':
          response = await TopUpsPending(token);
          break;
        case 'approved':
          response = await TopUpsApproved(token);
          break;
        case 'rejected':
          response = await TopUpsRejected(token);
          break;
        default:
          response = await TopUpsAll(token);
      }

      const apiData = response.data?.data;
      let topupsArray = [];

      if (apiData) {
        topupsArray =
          apiData.pending_topups ||
          apiData.approved_topups ||
          apiData.rejected_topups ||
          apiData.topups ||
          [];
      }

      // normalize amount เป็น Number (กัน reduce/format)
      topupsArray = topupsArray.map(t => ({
        ...t,
        amount: Number(t.amount)
      }));

      setTopups(topupsArray);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
      console.error('Error fetching topups:', err);
      setTopups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await TopUpStatistics(token);
      const statsData = response.data?.data?.statistics;

      if (statsData) {
        setStatistics({
          total: parseInt(statsData.total_topups) || 0,
          pending: parseInt(statsData.pending_count) || 0,
          approved: parseInt(statsData.approved_count) || 0,
          rejected: parseInt(statsData.rejected_count) || 0,
          totalAmount: parseFloat(statsData.total_approved_amount) || 0,
          // การ์ด "วันนี้" เราคำนวณเองจาก updated_at ด้านล่าง
          todayAmount: 0
        });
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTopups(activeTab);
      fetchStatistics();
    }
  }, [activeTab, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTopups(activeTab);
    await fetchStatistics();
    setRefreshing(false);
  };

  // ---------- Derived values ----------
  const filteredTopups = (Array.isArray(topups) ? topups : [])
    .filter(t =>
      t.rider_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.rider_phone?.includes(searchTerm) ||
      t.topup_id?.toString().includes(searchTerm) ||
      t.rider_id?.toString().includes(searchTerm)
    )
    // ใช้ updated_at เป็นหลัก (fallback created_at)
    .filter(t => !onlyToday || isToday(t.updated_at || t.created_at));

  const todayTopups = (Array.isArray(topups) ? topups : [])
    .filter(t => t.status === 'approved' && isToday(t.approved_at || t.updated_at || t.created_at));


  const todayCount = todayTopups.length;
  const todayAmount = todayTopups.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  // ---------- Actions ----------
  const handleApprove = async (topupId) => {
    try {
      setLoading(true);
      // เรียก API เพื่ออนุมัติ แต่ไม่รีเฟรชจากเซิร์ฟเวอร์ — อัปเดตสถานะในหน่วยความจำแทน
      const res = await ApproveTopUp(topupId, token);
      const approvedAt = res?.data?.data?.approved_at || new Date().toISOString();

      // อัปเดตรายการใน state
      let approvedAmount = 0;
      setTopups(prev => {
        return prev.map(t => {
          if (t.topup_id === topupId) {
            approvedAmount = Number(t.amount) || 0;
            return { ...t, status: 'approved', approved_at: approvedAt };
          }
          return t;
        });
      });

      // อัปเดตสถิติแบบ local
      setStatistics(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pending: Math.max(0, (prev.pending || 0) - 1),
          approved: (prev.approved || 0) + 1,
          totalAmount: (Number(prev.totalAmount) || 0) + approvedAmount
        };
      });

      setSelectedSlip(s => s ? { ...s, status: 'approved', approved_at: approvedAt } : null);
      alert('อนุมัติสำเร็จ!');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error('Error approving topup:', status, data, err);
      alert(data?.message || data?.error || 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }

    try {
      setLoading(true);
      await RejectTopUp(selectedSlip.topup_id, rejectionReason, token); // ฝั่ง API ต้องส่ง {status:'rejected'}
      await fetchTopups(activeTab);
      await fetchStatistics();
      setSelectedSlip(null);
      setShowRejectDialog(false);
      setRejectionReason('');
      alert('ปฏิเสธสำเร็จ!');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error('Error rejecting topup:', status, data, err);
      alert(data?.message || data?.error || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    const labels = {
      pending: 'รอดำเนินการ',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ'
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl bg-white bg-opacity-30 backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        <p className="text-white text-sm font-medium opacity-90 mb-1">{label}</p>
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );

  // ---------- Render ----------
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  จัดการการเติมเงิน GP ของไรเดอร์
                </h1>
                <p className="text-gray-600 mt-2 text-lg">ตรวจสอบและอนุมัติการเติมเงิน GP ของไรเดอร์</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium text-gray-700 hover:text-indigo-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                รีเฟรช
              </button>
            </div>
          </div>

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Clock}
                label="รอดำเนินการ"
                value={statistics.pending || 0}
                color="text-amber-600"
                gradient="from-amber-400 to-orange-500"
              />
              <StatCard
                icon={CheckCircle}
                label="อนุมัติแล้ว"
                value={statistics.approved || 0}
                color="text-emerald-600"
                gradient="from-emerald-400 to-teal-500"
              />
              <StatCard
                icon={DollarSign}
                label="ยอดรวมทั้งหมด"
                value={`฿${(statistics.totalAmount || 0).toLocaleString()}`}
                color="text-purple-600"
                gradient="from-purple-400 to-indigo-500"
              />
              <StatCard
                icon={TrendingUp}
                label={`วันนี้ (${todayCount} รายการ)`}
                value={`฿${todayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="text-blue-600"
                gradient="from-blue-400 to-cyan-500"
              />
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <nav className="flex flex-wrap gap-2">
                  {[
                    { key: 'pending', label: 'รอดำเนินการ', count: statistics?.pending },
                    { key: 'approved', label: 'อนุมัติแล้ว', count: statistics?.approved },
                    { key: 'rejected', label: 'ปฏิเสธ', count: statistics?.rejected },
                    { key: 'all', label: 'ทั้งหมด', count: statistics?.total }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key
                        ? 'bg-white text-indigo-600 shadow-lg scale-105'
                        : 'bg-white bg-opacity-20 text-black hover:bg-opacity-30 backdrop-blur-sm'
                        }`}
                    >
                      {tab.label} <span className="ml-1.5 opacity-75">({tab.count || 0})</span>
                    </button>
                  ))}
                </nav>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, เบอร์, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-500 outline-none w-full lg:w-80 shadow-lg font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-16 text-center">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-spin" />
                  <p className="text-gray-500 font-medium">กำลังโหลด...</p>
                </div>
              ) : filteredTopups.length === 0 ? (
                <div className="p-16 text-center">
                  <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูล</p>
                  <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนแท็บ</p>
                </div>
              ) : (
                filteredTopups.map((topup) => (
                  <div
                    key={topup.topup_id}
                    className="p-6 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {topup.rider_username?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                {topup.rider_username || 'ไม่ระบุชื่อ'}
                              </span>
                              {getStatusBadge(topup.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">ID: {topup.topup_id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 pl-15">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">📱</span>
                            <span>{topup.rider_phone || 'ไม่ระบุ'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">🆔</span>
                            <span>Rider ID: {topup.rider_id}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">📅</span>
                            <span>{new Date(topup.created_at).toLocaleString('th-TH')}</span>
                          </div>
                          <div className="flex items-center gap-3 md:col-span-2 p-2 bg-white rounded-lg shadow-sm">
                            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-600 font-semibold text-sm">
                              อัปเดตล่าสุด:
                            </span>
                            <span className="text-gray-700 text-sm">
                              {new Date(topup.updated_at).toLocaleString('th-TH')}
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 px-6 py-4 rounded-2xl border-2 border-indigo-100">
                          <p className="text-xs text-gray-600 font-semibold mb-1">จำนวนเงิน</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ฿{formatBaht(topup.amount)}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedSlip(topup)}
                          className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-4 h-4" />
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slip Detail Dialog */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 flex items-center justify-between z-10">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">รายละเอียดการเติมเงิน</h3>
                <p className="text-indigo-100 text-sm font-medium">
                  {selectedSlip.rider_username} • ฿{formatBaht(selectedSlip.amount)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSlip(null);
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl">
                <img
                  src={selectedSlip.slip_url}
                  alt="Payment Slip"
                  className="w-full max-h-[60vh] object-contain rounded-xl shadow-lg bg-white"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect fill="%23f3f4f6" width="400" height="600"/%3E%3Ctext x="200" y="300" font-family="Arial" font-size="18" fill="%239ca3af" text-anchor="middle"%3Eไม่สามารถโหลดรูปภาพ%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {selectedSlip.status === 'pending' && !showRejectDialog && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedSlip.topup_id)}
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <CheckCircle className="w-6 h-6" />
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl hover:from-rose-600 hover:to-red-600 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <XCircle className="w-6 h-6" />
                    ปฏิเสธ
                  </button>
                </div>
              )}

              {selectedSlip.status === 'pending' && showRejectDialog && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    ระบุเหตุผลการปฏิเสธ
                  </h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="กรุณาระบุเหตุผลที่ปฏิเสธการเติมเงินนี้..."
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows="4"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleReject}
                      disabled={loading || !rejectionReason.trim()}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      ยืนยันปฏิเสธ
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectDialog(false);
                        setRejectionReason('');
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-bold"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              {selectedSlip.status === 'approved' && (
                <div className="text-center py-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 text-emerald-600" />
                  <p className="text-emerald-900 font-bold text-lg">อนุมัติเรียบร้อยแล้ว</p>
                  <p className="text-emerald-700 text-sm mt-1">
                    {new Date(selectedSlip.approved_at).toLocaleString('th-TH')}
                  </p>
                </div>
              )}

              {selectedSlip.status === 'rejected' && (
                <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-red-900 font-bold text-lg">ปฏิเสธแล้ว</p>
                      <p className="text-red-700 text-sm">
                        {new Date(selectedSlip.updated_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                  {selectedSlip.rejection_reason && (
                    <div className="mt-4 bg-white rounded-xl p-4 border border-red-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">เหตุผล:</p>
                      <p className="text-gray-800">{selectedSlip.rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
