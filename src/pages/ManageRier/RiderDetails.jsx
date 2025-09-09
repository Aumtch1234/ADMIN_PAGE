import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getRiderDetails, approveRider, rejectRider } from '../../APIs/RiderAPI';
import { jwtDecode } from 'jwt-decode';

export default function RiderDetails() {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
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
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">ไม่พบข้อมูลไรเดอร์</p>
            <button
              onClick={() => navigate('/riders')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              กลับไปหน้ารายการ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { rider_info, identity_documents, vehicle_info, address, approval_info } = rider;

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">รายละเอียดไรเดอร์</h1>
              <p className="text-gray-600">ข้อมูลและเอกสารของไรเดอร์</p>
            </div>
            <button
              onClick={() => navigate('/riders')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← กลับไปหน้ารายการ
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              approval_info.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              approval_info.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              สถานะ: {
                approval_info.status === 'pending' ? 'รออนุมัติ' :
                approval_info.status === 'approved' ? 'อนุมัติแล้ว' :
                'ปฏิเสธ'
              }
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ข้อมูลส่วนตัว */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนตัว</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ชื่อผู้ใช้:</span>
                  <span className="font-medium">{rider_info.display_name || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">อีเมล:</span>
                  <span className="font-medium">{rider_info.email || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เบอร์โทร:</span>
                  <span className="font-medium">{rider_info.phone || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันเกิด:</span>
                  <span className="font-medium">
                    {rider_info.birthdate ? new Date(rider_info.birthdate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เพศ:</span>
                  <span className="font-medium">
                    {rider_info.gender === 0 ? 'ชาย' : rider_info.gender === 1 ? 'หญิง' : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่สมัคร:</span>
                  <span className="font-medium">
                    {rider_info.registered_at ? new Date(rider_info.registered_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
            </div>

            {/* ข้อมูลเอกสาร */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">เอกสารประจำตัว</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">เลขบัตรประชาชน:</span>
                  <span className="font-medium">{identity_documents.id_card_number || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เลขใบขับขี่:</span>
                  <span className="font-medium">{identity_documents.driving_license_number || 'ไม่ระบุ'}</span>
                </div>
              </div>
              
              {/* รูปภาพเอกสาร */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                {identity_documents.id_card_photo_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">รูปบัตรประชาชน</p>
                    <img 
                      src={identity_documents.id_card_photo_url} 
                      alt="บัตรประชาชน" 
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {identity_documents.driving_license_photo_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">รูปใบขับขี่</p>
                    <img 
                      src={identity_documents.driving_license_photo_url} 
                      alt="ใบขับขี่" 
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ข้อมูลยานพาหนะ */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลยานพาหนะ</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ประเภท:</span>
                  <span className="font-medium">{vehicle_info.vehicle_type || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ยี่ห้อ/รุ่น:</span>
                  <span className="font-medium">{vehicle_info.vehicle_brand_model || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สี:</span>
                  <span className="font-medium">{vehicle_info.vehicle_color || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เลขทะเบียน:</span>
                  <span className="font-medium">{vehicle_info.vehicle_registration_number || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จังหวัดที่จดทะเบียน:</span>
                  <span className="font-medium">{vehicle_info.vehicle_registration_province || 'ไม่ระบุ'}</span>
                </div>
              </div>
              
              {/* รูปภาพยานพาหนะ */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                {vehicle_info.vehicle_photo_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">รูปยานพาหนะ</p>
                    <img 
                      src={vehicle_info.vehicle_photo_url} 
                      alt="ยานพาหนะ" 
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                {vehicle_info.vehicle_registration_photo_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">รูปเล่มทะเบียน</p>
                    <img 
                      src={vehicle_info.vehicle_registration_photo_url} 
                      alt="เล่มทะเบียน" 
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ที่อยู่ */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">ที่อยู่</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">บ้านเลขที่:</span>
                  <span className="font-medium">{address.house_number || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ถนน:</span>
                  <span className="font-medium">{address.street || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ตำบล:</span>
                  <span className="font-medium">{address.subdistrict || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">อำเภอ:</span>
                  <span className="font-medium">{address.district || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จังหวัด:</span>
                  <span className="font-medium">{address.province || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">รหัสไปรษณีย์:</span>
                  <span className="font-medium">{address.postal_code || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลการอนุมัติ */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลการอนุมัติ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่ส่งคำขอ:</span>
                  <span className="font-medium">
                    {approval_info.submitted_at ? new Date(approval_info.submitted_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่ดำเนินการ:</span>
                  <span className="font-medium">
                    {approval_info.approved_at ? new Date(approval_info.approved_at).toLocaleDateString('th-TH') : 'ยังไม่ดำเนินการ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ผู้ดำเนินการ:</span>
                  <span className="font-medium">{approval_info.approved_by || 'ยังไม่ดำเนินการ'}</span>
                </div>
              </div>
              
              {approval_info.rejection_reason && (
                <div>
                  <span className="text-gray-600">เหตุผลในการปฏิเสธ:</span>
                  <p className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                    {approval_info.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {approval_info.status === 'pending' && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleApprove}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                อนุมัติไรเดอร์
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                ปฏิเสธไรเดอร์
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">ปฏิเสธไรเดอร์</h3>
            <p className="text-gray-600 mb-4">
              กรุณาระบุเหตุผลในการปฏิเสธไรเดอร์: {rider_info.display_name}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded p-3 mb-4"
              rows="4"
              placeholder="ระบุเหตุผล..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
