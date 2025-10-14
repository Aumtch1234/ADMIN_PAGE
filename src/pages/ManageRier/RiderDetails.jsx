import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getRiderDetails, approveRider, rejectRider } from '../../APIs/RiderAPI';
import { jwtDecode } from 'jwt-decode';
// no extra hooks

export default function RiderDetails() {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  // image lightbox state
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  
  const token = localStorage.getItem('token');
  const adminId = token ? jwtDecode(token).id : null;

  const fetchRiderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRiderDetails(riderId);
      setRider(response.data);
    } catch (error) {
      console.error('Error fetching rider details:', error);
      alert('ไม่พบข้อมูลไรเดอร์');
      navigate('/riders');
    } finally {
      setLoading(false);
    }
  }, [riderId, navigate]);

  useEffect(() => {
    fetchRiderDetails();
  }, [fetchRiderDetails]);

  // handle ESC to close image modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isImageOpen) closeImageModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isImageOpen]);

  const openImageModal = (src, alt) => {
    setImageSrc(src);
    setImageAlt(alt || 'รูปภาพ');
    setIsImageOpen(true);
  };

  const closeImageModal = () => {
    setIsImageOpen(false);
    setImageSrc('');
    setImageAlt('');
  };

  const handleApprove = async () => {
    try {
      await approveRider(riderId, adminId);
      alert('อนุมัติไรเดอร์สำเร็จ');
      fetchRiderDetails();
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    try {
      await rejectRider(riderId, adminId, rejectReason);
      alert('ปฏิเสธไรเดอร์สำเร็จ');
      setShowRejectModal(false);
      setRejectReason('');
      fetchRiderDetails();
    } catch (error) {
      console.error('Error rejecting rider:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
            </div>
            <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-sm mx-auto">
              <p className="text-lg font-semibold text-gray-700 mb-2">กำลังโหลดข้อมูล...</p>
              <p className="text-sm text-gray-500">โปรดรอสักครู่</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-4">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลไรเดอร์</h2>
              <p className="text-gray-600 mb-6">ไม่สามารถโหลดข้อมูลไรเดอร์ได้ กรุณาลองใหม่อีกครั้ง</p>
              <button
                onClick={() => navigate('/riders')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับไปหน้ารายการ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { rider_info, identity_documents, vehicle_info, address, approval_info } = rider;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  รายละเอียดไรเดอร์
                </h1>
                <p className="text-gray-500 text-lg">ข้อมูลและเอกสารของไรเดอร์ #{riderId}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/riders')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>กลับไปหน้ารายการ</span>
            </button>
          </div>

          {/* Enhanced Status Badge */}
          <div className="flex items-center space-x-4">
            <div className={`px-6 py-3 rounded-2xl text-base font-semibold shadow-lg border-2 ${
              approval_info.status === 'pending' 
                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300' :
              approval_info.status === 'approved' 
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' :
                'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  approval_info.status === 'pending' ? 'bg-yellow-500' :
                  approval_info.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}></div>
                <span>
                  สถานะ: {
                    approval_info.status === 'pending' ? 'รออนุมัติ' :
                    approval_info.status === 'approved' ? 'อนุมัติแล้ว' :
                    'ปฏิเสธ'
                  }
                </span>
              </div>
            </div>
            
            {/* Registration Date Badge */}
            <div className="px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200">
              <span className="text-sm text-gray-600">วันที่สมัคร: </span>
              <span className="font-semibold text-gray-800">
                {rider_info.registered_at ? new Date(rider_info.registered_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* ข้อมูลส่วนตัว - Enhanced */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">ข้อมูลส่วนตัว</h2>
            </div>
            
            {/* Profile Image Section */}
            {rider_info.photo_url && (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img 
                    src={rider_info.photo_url} 
                    alt="รูปโปรไฟล์" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">ชื่อผู้ใช้:</span>
                  <span className="font-semibold text-gray-800">{rider_info.display_name || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">อีเมล:</span>
                  <span className="font-semibold text-gray-800">{rider_info.email || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-purple-500">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">เบอร์โทร:</span>
                  <span className="font-semibold text-gray-800">{rider_info.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-500">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">วันเกิด:</span>
                  <span className="font-semibold text-gray-800">
                    {rider_info.birthdate ? new Date(rider_info.birthdate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-pink-500">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">เพศ:</span>
                  <span className="font-semibold text-gray-800">
                    {rider_info.gender === 0 ? 'ชาย' : rider_info.gender === 1 ? 'หญิง' : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลเอกสาร - Enhanced */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">เอกสารประจำตัว</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">เลขบัตรประชาชน:</span>
                  <span className="font-bold text-blue-800">{identity_documents.id_card_number || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">เลขใบขับขี่:</span>
                  <span className="font-bold text-green-800">{identity_documents.driving_license_number || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
            
            {/* รูปภาพเอกสาร - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {identity_documents.id_card_photo_url && (
                <div className="group">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    รูปบัตรประชาชน
                  </p>
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <img 
                        src={identity_documents.id_card_photo_url} 
                        alt="บัตรประชาชน" 
                        onClick={() => openImageModal(identity_documents.id_card_photo_url, 'รูปบัตรประชาชน')}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                  </div>
                </div>
              )}
              {identity_documents.driving_license_photo_url && (
                <div className="group">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    รูปใบขับขี่
                  </p>
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={identity_documents.driving_license_photo_url} 
                      alt="ใบขับขี่" 
                      onClick={() => openImageModal(identity_documents.driving_license_photo_url, 'รูปใบขับขี่')}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {identity_documents.id_card_selfie_url && (
              <div className="mt-6 group">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  ถ่ายคู่บัตรประชาชน
                </p>
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 max-w-md mx-auto">
                  <img 
                    src={identity_documents.id_card_selfie_url} 
                    alt="ถ่ายคู่บัตรประชาชน" 
                    onClick={() => openImageModal(identity_documents.id_card_selfie_url, 'ถ่ายคู่บัตรประชาชน')}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* ข้อมูลยานพาหนะ - Enhanced */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">ข้อมูลยานพาหนะ</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 font-medium">ประเภท:</span>
                  <span className="font-bold text-orange-800">{vehicle_info.vehicle_type || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 font-medium">ยี่ห้อ/รุ่น:</span>
                  <span className="font-bold text-purple-800">{vehicle_info.vehicle_brand_model || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                <div className="flex justify-between items-center">
                  <span className="text-pink-700 font-medium">สี:</span>
                  <span className="font-bold text-pink-800">{vehicle_info.vehicle_color || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-700 font-medium">เลขทะเบียน:</span>
                  <span className="font-bold text-indigo-800">{vehicle_info.vehicle_registration_number || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-teal-700 font-medium">จังหวัดที่จดทะเบียน:</span>
                  <span className="font-bold text-teal-800">{vehicle_info.vehicle_registration_province || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
            
            {/* รูปภาพยานพาหนะ - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicle_info.vehicle_photo_url && (
                <div className="group">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    รูปยานพาหนะ
                  </p>
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={vehicle_info.vehicle_photo_url} 
                      alt="ยานพาหนะ" 
                      onClick={() => openImageModal(vehicle_info.vehicle_photo_url, 'รูปยานพาหนะ')}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
              {vehicle_info.vehicle_registration_photo_url && (
                <div className="group">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    รูปเล่มทะเบียน
                  </p>
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={vehicle_info.vehicle_registration_photo_url} 
                      alt="เล่มทะเบียน" 
                      onClick={() => openImageModal(vehicle_info.vehicle_registration_photo_url, 'รูปเล่มทะเบียน')}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ที่อยู่ - Enhanced */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">ที่อยู่</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700 font-medium">บ้านเลขที่:</span>
                  <span className="font-bold text-cyan-800">{address.house_number || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-teal-700 font-medium">ถนน:</span>
                  <span className="font-bold text-teal-800">{address.street || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-medium">ตำบล:</span>
                  <span className="font-bold text-emerald-800">{address.subdistrict || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">อำเภอ:</span>
                  <span className="font-bold text-green-800">{address.district || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">จังหวัด:</span>
                  <span className="font-bold text-blue-800">{address.province || 'ไม่ระบุ'}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-700 font-medium">รหัสไปรษณีย์:</span>
                  <span className="font-bold text-indigo-800">{address.postal_code || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลการอนุมัติ - Enhanced */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">ข้อมูลการอนุมัติ</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-6 rounded-xl border border-violet-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                    <span className="text-violet-700 font-medium">วันที่ส่งคำขอ:</span>
                  </div>
                  <span className="font-bold text-violet-800">
                    {approval_info.submitted_at ? new Date(approval_info.submitted_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-700 font-medium">วันที่ดำเนินการ:</span>
                  </div>
                  <span className="font-bold text-purple-800">
                    {approval_info.approved_at ? new Date(approval_info.approved_at).toLocaleDateString('th-TH') : 'ยังไม่ดำเนินการ'}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-pink-700 font-medium">ผู้ดำเนินการ:</span>
                  </div>
                  <span className="font-bold text-pink-800">{approval_info.approved_by || 'ยังไม่ดำเนินการ'}</span>
                </div>
              </div>
            </div>
            
            {approval_info.rejection_reason && (
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-semibold text-red-800">เหตุผลในการปฏิเสธ:</span>
                  </div>
                  <p className="text-red-700 leading-relaxed bg-white p-4 rounded-lg border border-red-300">
                    {approval_info.rejection_reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Enhanced */}
        {approval_info.status === 'pending' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-6">ดำเนินการอนุมัติ</h3>
              <div className="flex justify-center space-x-6">
                <button
                  onClick={handleApprove}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>อนุมัติไรเดอร์</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>ปฏิเสธไรเดอร์</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ปฏิเสธไรเดอร์</h3>
              <p className="text-gray-600">
                กรุณาระบุเหตุผลในการปฏิเสธไรเดอร์: <span className="font-semibold text-gray-800">{rider_info.display_name}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">เหตุผลในการปฏิเสธ *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 resize-none"
                rows="4"
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธอย่างละเอียด..."
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>ยกเลิก</span>
              </button>
              <button
                onClick={handleReject}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>ยืนยันปฏิเสธ</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Image Lightbox Modal */}
      {isImageOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70" onClick={closeImageModal}>
          <div className="max-w-5xl w-full mx-4">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); closeImageModal(); }}
                className="absolute top-3 right-3 z-50 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80"
                aria-label="ปิด"
              >
                ✕
              </button>
              <img
                src={imageSrc}
                alt={imageAlt}
                onClick={(e) => e.stopPropagation()}
                className="mx-auto max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              />
              {imageAlt && (
                <div className="mt-4 text-center text-white text-sm opacity-90">{imageAlt}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
