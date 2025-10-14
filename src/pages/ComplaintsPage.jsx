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
} from "react-icons/fa";
import Navbar from "../components/Navbar";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://20.189.96.19:4000/client/complaints");
        setComplaints(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.patch(`http://20.189.96.19:4000/client/complaints/${complaintId}`, {
        status: newStatus
      });
      
      setComplaints(complaints.map(c => 
        c.complaint_id === complaintId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error("❌ Failed to update status", err);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.market_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || c.role === filterRole;
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Navbar/>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                คำร้องเรียนทั้งหมด
              </h1>
              <p className="text-gray-500">
                จัดการและติดตามคำร้องเรียนจากผู้ใช้งาน
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUser className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ร้านค้า</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.role === "market").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaStore className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ไรเดอร์</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.role === "rider").length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FaMotorcycle className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ลูกค้า</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complaints.filter(c => c.role === "member").length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaUser className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ, อีเมล, หัวข้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-11 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px]"
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
                className="pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px]"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="pending">ยังไม่ได้ตรวจสอบ</option>
                <option value="checked">ตรวจสอบแล้ว</option>
              </select>
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
                <FaUser className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 text-lg">ไม่พบคำร้องเรียนที่ค้นหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ผู้ส่ง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ข้อมูลติดต่อ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      บทบาท
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      เรื่องร้องเรียน
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      หลักฐาน
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      วันที่ส่ง
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredComplaints.map((c, i) => {
                    let senderIcon, senderName, accountName;

                    if (c.role === "market") {
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

                    return (
                      <tr key={c.complaint_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{i + 1}</span>
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
                              <div className="text-xs text-gray-500">
                                {accountName}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{c.email || "-"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(c.role)}`}>
                            {getRoleLabel(c.role)}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-md">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {c.subject}
                          </div>
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            <FaEye /> ดูรายละเอียด
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {c.evidence_url ? (
                            <button
                              onClick={() =>
                                setSelectedImage(`http://20.189.96.19:4000${c.evidence_url}`)
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                            >
                              <FaImage /> ดูรูป
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <select
                            value={c.status || "pending"}
                            onChange={(e) => handleStatusChange(c.complaint_id, e.target.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                              (c.status || "pending") === "checked"
                                ? "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500"
                            }`}
                          >
                            <option value="pending">ยังไม่ได้ตรวจสอบ</option>
                            <option value="checked">ตรวจสอบแล้ว</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(c.created_at).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit"
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-colors duration-200 shadow-lg"
            >
              <FaTimes className="text-xl" />
            </button>
            <div className="p-4">
              <img
                src={selectedImage}
                alt="หลักฐาน"
                className="max-h-[80vh] w-auto mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">รายละเอียดคำร้องเรียน</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">ข้อมูลผู้ส่ง</h4>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {selectedComplaint.role === "market" ? (
                      <FaStore className="text-green-500 text-xl" />
                    ) : selectedComplaint.role === "rider" ? (
                      <FaMotorcycle className="text-orange-500 text-xl" />
                    ) : (
                      <FaUser className="text-blue-500 text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900 mb-1">
                      {selectedComplaint.role === "market"
                        ? selectedComplaint.market_name || "ไม่ระบุร้าน"
                        : selectedComplaint.role === "rider"
                        ? selectedComplaint.rider_name || "ไม่ระบุไรเดอร์"
                        : selectedComplaint.user_name || "ไม่ระบุผู้ใช้"}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {selectedComplaint.user_name || "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedComplaint.email || "-"}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(selectedComplaint.role)}`}>
                        {getRoleLabel(selectedComplaint.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">หัวข้อ</h4>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg p-4">
                  {selectedComplaint.subject}
                </p>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">รายละเอียด</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedComplaint.message}
                  </p>
                </div>
              </div>

              {/* Evidence */}
              {selectedComplaint.evidence_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">หลักฐาน</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={`http://20.189.96.19:4000${selectedComplaint.evidence_url}`}
                      alt="หลักฐาน"
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(`http://20.189.96.19:4000${selectedComplaint.evidence_url}`)}
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      คลิกที่รูปเพื่อขยาย
                    </p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">วันที่ส่ง</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
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
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">สถานะการตรวจสอบ</h4>
                <select
                  value={selectedComplaint.status || "pending"}
                  onChange={(e) => {
                    handleStatusChange(selectedComplaint.complaint_id, e.target.value);
                    setSelectedComplaint({ ...selectedComplaint, status: e.target.value });
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-base font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                    (selectedComplaint.status || "pending") === "checked"
                      ? "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500"
                  }`}
                >
                  <option value="pending">ยังไม่ได้ตรวจสอบ</option>
                  <option value="checked">ตรวจสอบแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}