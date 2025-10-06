import API from './midleware';

export const TopUpsAll = (token) =>
    API.get(`/topups/all`, {
        headers: { Authorization: `Bearer ${token}` },
    });
export const TopUpsPending = (token) =>
    API.get(`/topups/pending`, {
        headers: { Authorization: `Bearer ${token}` },
    });
export const TopUpsApproved = (token) =>
    API.get(`/topups/approved`, {
        headers: { Authorization: `Bearer ${token}` },
    });
export const TopUpsRejected = (token) =>
    API.get(`/topups/rejected`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const ApproveTopUp = (topup_id, token) =>
    API.put(
        `/topups/${topup_id}/approve`,
        { status: 'approved' },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

export const RejectTopUp = (topup_id, rejection_reason, token) =>
    API.put(`/topups/${topup_id}/approve`,
        {
            status: 'rejected',
            rejection_reason: rejection_reason
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

export const TopUpStatistics = (token) =>
    API.get(`/topups/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Top-up Management
// router.get('/topups/all', verifyToken, topup_Controller.adminGetAllRiderTopUps);
// router.get('/topups/pending', verifyToken, topup_Controller.adminGetPendingRiderTopUps);
// router.get('/topups/approved', verifyToken, topup_Controller.adminGetApprovedRiderTopUps);
// router.get('/topups/rejected', verifyToken, topup_Controller.adminGetRejectedRiderTopUps);
// router.put('/topups/:topup_id/approve', debugRequestBody, verifyToken, topup_Controller.adminApproveRiderTopUp);
// router.get('/topups/statistics', verifyToken, topup_Controller.adminGetTopUpStatistics);
