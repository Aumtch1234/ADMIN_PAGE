import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaStore,
  FaMotorcycle,
  FaImage,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaShoppingBag,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import API from "../APIs/midleware";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API.BASES.pasin}/client/complaints`);
      setComplaints(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type) => {
    return type === "shop_closed" ? "รายงานร้านปิด" : "คำร้องเรียนทั่วไป";
  };

  const getReportTypeBadge = (type) => {
    return type === "shop_closed"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-blue-100 text-blue-700 border border-blue-200";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "market":
        return "ร้านค้าสมาชิก";
      case "rider":
        return "ผู้ส่งอาหาร";
      case "member":
      default:
        return "ลูกค้าทั่วไป";
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "market":
        return "bg-green-100 text-green-700";
      case "rider":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "checked":
      case "resolved":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-700",
          icon: <FaCheckCircle className="text-green-600" />,
          label: "ตรวจสอบแล้ว",
        };
      case "pending":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-700",
          icon: <FaClock className="text-yellow-600" />,
          label: "รอดำเนินการ",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-700",
          icon: <FaExclamationTriangle className="text-gray-600" />,
          label: "ไม่ทราบสถานะ",
        };
    }
  };

  const handleStatusChange = async (complaintId, newStatus, reportType) => {
    try {
      await axios.patch(`${API.BASES.pasin}/client/complaints/shop-closed/${complaintId}`, {
        status: newStatus,
        report_type: reportType,
      });

      setComplaints(
        complaints.map((c) =>
          c.complaint_id === complaintId ? { ...c, status: newStatus } : c
        )
      );

      if (selectedComplaint?.complaint_id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (err) {
      console.error("❌ Failed to update status", err);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.market_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.order_id?.toString().includes(searchTerm);

    const matchesRole = filterRole === "all" || c.role === filterRole;
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesType =
      filterType === "all" ||
      (filterType === "shop_closed" && c.report_type === "shop_closed") ||
      (filterType === "complaint" && c.report_type !== "shop_closed");

    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

  const stats = {
    total: complaints.length,
    shopClosed: complaints.filter((c) => c.report_type === "shop_closed").length,
    regularComplaints: complaints.filter((c) => c.report_type !== "shop_closed").length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "checked" || c.status === "resolved").length,
  };

  const prepareImages = (complaint) => {
    const images = [];
    if (complaint.evidence_url) {
      images.push(`${API.BASES.pasin}${complaint.evidence_url}`);
    }
    if (complaint.image_urls && complaint.image_urls.length > 0) {
      complaint.image_urls.forEach((url) =>
        images.push(url.startsWith("http") ? url : `${API.BASES.pasin}${url}`)
      );
    }
    return images;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ระบบจัดการคำร้องเรียน
              </h1>
              <p className="text-gray-500">
                จัดการคำร้องเรียนและรายงานร้านปิดทั้งหมด
              </p>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
            >
              <FaArrowLeft /> กลับแดชบอร์ด
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FaUser className="text-blue-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">ทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FaStore className="text-red-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">รายงานร้านปิด</p>
              <p className="text-3xl font-bold text-gray-900">{stats.shopClosed}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FaExclamationTriangle className="text-purple-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">ร้องเรียนทั่วไป</p>
              <p className="text-3xl font-bold text-gray-900">{stats.regularComplaints}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">รอดำเนินการ</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm">ดำเนินการแล้ว</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ, อีเมล, หมายเลขออเดอร์, หัวข้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="shop_closed">รายงานร้านปิด</option>
                  <option value="complaint">คำร้องเรียนทั่วไป</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">ทุกบทบาท</option>
                  <option value="market">ร้านค้าสมาชิก</option>
                  <option value="rider">ผู้ส่งอาหาร</option>
                  <option value="member">ลูกค้าทั่วไป</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="checked">ดำเนินการแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 text-lg">ไม่พบข้อมูลที่ค้นหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      ประเภท
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      ผู้ส่ง/ร้านค้า
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      ข้อมูล
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      เรื่อง
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      หลักฐาน
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      วันที่
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredComplaints.map((c, i) => {
                    let senderIcon, senderName, accountName;

                    if (c.report_type === "shop_closed") {
                      senderIcon = <FaMotorcycle className="text-orange-500 text-xl" />;
                      senderName = c.rider_name || "ไม่ระบุไรเดอร์";
                      accountName = c.rider_email || "-";
                    } else if (c.role === "market") {
                      senderIcon = <FaStore className="text-green-500 text-xl" />;
                      senderName = c.market_name || "ไม่ระบุร้าน";
                      accountName = c.owner_name || c.user_name || "-";
                    } else if (c.role === "rider") {
                      senderIcon = <FaMotorcycle className="text-orange-500 text-xl" />;
                      senderName = c.rider_name || "ไม่ระบุไรเดอร์";
                      accountName = c.user_name || "-";
                    } else {
                      senderIcon = <FaUser className="text-blue-500 text-xl" />;
                      senderName = c.user_name || "ไม่ระบุผู้ใช้";
                      accountName = c.user_name || "-";
                    }

                    const statusInfo = getStatusBadge(c.status);

                    return (
                      <tr key={`${c.report_type}-${c.complaint_id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{i + 1}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getReportTypeBadge(
                              c.report_type
                            )}`}
                          >
                            {getReportTypeLabel(c.report_type)}
                          </span>
                          {c.order_id && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <FaShoppingBag className="text-xs" />
                              Order #{c.order_id}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {senderIcon}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {senderName}
                              </div>
                              {c.report_type === "shop_closed" && c.market_name && (
                                <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                                  <FaStore className="text-xs" />
                                  {c.market_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{c.email || accountName}</div>
                          {c.role && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeClass(
                                c.role
                              )}`}
                            >
                              {getRoleLabel(c.role)}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {c.subject || c.reason || "-"}
                          </div>
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            <FaEye /> ดูรายละเอียด
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {prepareImages(c).length > 0 ? (
                            <button
                              onClick={() => {
                                const images = prepareImages(c);
                                
                                setSelectedImage({ images, index: 0 });
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                            >
                              <FaImage /> ดูรูป {prepareImages(c).length > 1 ? `(${prepareImages(c).length})` : ""}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <select
                            value={c.status || "pending"}
                            onChange={(e) =>
                              handleStatusChange(c.complaint_id, e.target.value, c.report_type)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all border ${statusInfo.bg} ${statusInfo.text}`}
                          >
                            <option value="pending">รอดำเนินการ</option>
                            <option value="checked">ดำเนินการแล้ว</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(c.created_at).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal - Frosted Glass */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full h-[90vh] flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-md border border-white/30 transition-all shadow-lg"
            >
              <FaTimes className="text-2xl" />
            </button>

            {/* Previous / Next Buttons */}
            {selectedImage.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((prev) => ({
                      ...prev,
                      index:
                        prev.index === 0
                          ? prev.images.length - 1
                          : prev.index - 1,
                    }))
                  }
                  className="absolute left-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 backdrop-blur-md border border-white/30 transition-all shadow-lg"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((prev) => ({
                      ...prev,
                      index:
                        prev.index === prev.images.length - 1
                          ? 0
                          : prev.index + 1,
                    }))
                  }
                  className="absolute right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 backdrop-blur-md border border-white/30 transition-all shadow-lg"
                >
                  <FaChevronRight className="text-2xl" />
                </button>
              </>
            )}

            {/* Main Image */}
            <img
              src={selectedImage.images[selectedImage.index]}
              alt="หลักฐาน"
              className="max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {/* Indicator Bar */}
            {selectedImage.images.length > 1 && (
              <div className="mt-6 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                {selectedImage.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setSelectedImage((prev) => ({ ...prev, index: i }))
                    }
                    className={`rounded-full transition-all duration-300 ${
                      i === selectedImage.index
                        ? "bg-white w-8 h-3"
                        : "bg-white/50 hover:bg-white/70 w-3 h-3"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaint Detail Modal - Frosted Glass */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-white/30">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-white/30 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">รายละเอียด</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getReportTypeBadge(
                    selectedComplaint.report_type
                  )}`}
                >
                  {getReportTypeLabel(selectedComplaint.report_type)}
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Order Info */}
              {selectedComplaint.order_id && (
                <div className="bg-red-50/80 backdrop-blur-md border border-red-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaShoppingBag className="text-red-600 text-lg" />
                    <h4 className="text-sm font-semibold text-red-800 uppercase">
                      ข้อมูลออเดอร์
                    </h4>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    Order #{selectedComplaint.order_id}
                  </div>
                </div>
              )}

              {/* Sender/Shop Info */}
              <div className="bg-gray-50/80 backdrop-blur-md border border-gray-200/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {selectedComplaint.report_type === "shop_closed"
                    ? "ข้อมูลไรเดอร์และร้านค้า"
                    : "ข้อมูลผู้ส่ง"}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/30">
                      {selectedComplaint.report_type === "shop_closed" ? (
                        <FaMotorcycle className="text-orange-500 text-xl" />
                      ) : selectedComplaint.role === "market" ? (
                        <FaStore className="text-green-500 text-xl" />
                      ) : selectedComplaint.role === "rider" ? (
                        <FaMotorcycle className="text-orange-500 text-xl" />
                      ) : (
                        <FaUser className="text-blue-500 text-xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900 mb-1">
                        {selectedComplaint.report_type === "shop_closed"
                          ? selectedComplaint.rider_name || "ไม่ระบุไรเดอร์"
                          : selectedComplaint.role === "market"
                            ? selectedComplaint.market_name || "ไม่ระบุร้าน"
                            : selectedComplaint.role === "rider"
                              ? selectedComplaint.rider_name || "ไม่ระบุไรเดอร์"
                              : selectedComplaint.user_name || "ไม่ระบุผู้ใช้"}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {selectedComplaint.user_name || selectedComplaint.owner_name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedComplaint.email || selectedComplaint.rider_email || "-"}
                      </div>
                      {selectedComplaint.role && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(
                              selectedComplaint.role
                            )}`}
                          >
                            {getRoleLabel(selectedComplaint.role)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Info for shop_closed */}
                  {selectedComplaint.report_type === "shop_closed" &&
                    selectedComplaint.market_name && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-red-100/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-200/30">
                            <FaStore className="text-red-600 text-xl" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-red-800 uppercase mb-1">
                              ร้านที่รายงาน
                            </div>
                            <div className="text-base font-semibold text-gray-900">
                              {selectedComplaint.market_name}
                            </div>
                            {selectedComplaint.owner_name && (
                              <div className="text-sm text-gray-600">
                                เจ้าของร้าน: {selectedComplaint.owner_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Subject/Reason */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  {selectedComplaint.report_type === "shop_closed" ? "เหตุผล" : "หัวข้อ"}
                </h4>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50/80 backdrop-blur-md border border-gray-200/50 rounded-lg p-4">
                  {selectedComplaint.subject || selectedComplaint.reason || "-"}
                </p>
              </div>

              {/* Message/Note */}
              {(selectedComplaint.message || selectedComplaint.note) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    รายละเอียด
                  </h4>
                  <div className="bg-gray-50/80 backdrop-blur-md border border-gray-200/50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedComplaint.message || selectedComplaint.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Evidence */}
              {prepareImages(selectedComplaint).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    หลักฐาน
                  </h4>
                  <div className="bg-gray-50/80 backdrop-blur-md border border-gray-200/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {prepareImages(selectedComplaint).map((url, idx) => (
                        <div key={idx} className="relative group cursor-pointer">
                          <img
                            src={url}
                            alt={`หลักฐาน ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage({
                              images: prepareImages(selectedComplaint),
                              index: idx
                            })}
                          />
                          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {idx + 1}/{prepareImages(selectedComplaint).length}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaEye className="text-white text-2xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      คลิกที่รูปเพื่อขยาย
                    </p>
                  </div>
                </div>
              )}

              {/* Reviewed Info */}
              {selectedComplaint.reviewed_at && (
                <div className="bg-blue-50/80 backdrop-blur-md border border-blue-200/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 uppercase mb-2">
                    ข้อมูลการตรวจสอบ
                  </h4>
                  <div className="text-sm text-blue-900">
                    ตรวจสอบเมื่อ:{" "}
                    {new Date(selectedComplaint.reviewed_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  วันที่ส่ง
                </h4>
                <p className="text-gray-700 bg-gray-50/80 backdrop-blur-md border border-gray-200/50 rounded-lg p-4">
                  {new Date(selectedComplaint.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Status Control */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  สถานะการตรวจสอบ
                </h4>
                <select
                  value={selectedComplaint.status || "pending"}
                  onChange={(e) => {
                    handleStatusChange(
                      selectedComplaint.complaint_id,
                      e.target.value,
                      selectedComplaint.report_type
                    );
                    setSelectedComplaint({ ...selectedComplaint, status: e.target.value });
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-base font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all border ${getStatusBadge(selectedComplaint.status || "pending").bg
                    } ${getStatusBadge(selectedComplaint.status || "pending").text}`}
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="checked">ดำเนินการแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}