import api from './index';

// Customer return functions
export const createReturnRequest = async (returnData) => {
  try {
    const response = await api.post('/returns', returnData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create return request';
  }
};

export const getUserReturns = async (params = {}) => {
  try {
    const response = await api.get('/returns/my-returns', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch returns';
  }
};

export const getReturnById = async (returnId) => {
  try {
    const response = await api.get(`/returns/${returnId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch return details';
  }
};

export const updateReturnRequest = async (returnId, updateData) => {
  try {
    const response = await api.put(`/returns/${returnId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update return request';
  }
};

export const cancelReturnRequest = async (returnId, reason) => {
  try {
    const response = await api.delete(`/returns/${returnId}`, {
      data: { reason }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to cancel return request';
  }
};

export const checkReturnEligibility = async (orderId) => {
  try {
    const response = await api.get(`/returns/check-eligibility/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to check return eligibility';
  }
};

// Admin return functions
export const getAdminReturns = async (params = {}) => {
  try {
    const response = await api.get('/returns/admin', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch admin returns';
  }
};

export const updateReturnStatus = async (returnId, statusData) => {
  try {
    const response = await api.put(`/returns/admin/${returnId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update return status';
  }
};

export const processInspection = async (returnId, inspectionData) => {
  try {
    const response = await api.put(`/returns/admin/${returnId}/inspection`, inspectionData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to process inspection';
  }
};

export const getReturnAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/returns/admin/analytics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch return analytics';
  }
};

// Helper functions
export const getReturnStatusColor = (status) => {
  const statusColors = {
    requested: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    pickup_scheduled: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    received: 'bg-orange-100 text-orange-800',
    inspected: 'bg-cyan-100 text-cyan-800',
    processed: 'bg-green-100 text-green-800',
    completed: 'bg-green-200 text-green-900',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getReturnStatusText = (status) => {
  const statusTexts = {
    requested: 'Return Requested',
    approved: 'Return Approved',
    rejected: 'Return Rejected',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Item Picked Up',
    received: 'Item Received',
    inspected: 'Item Inspected',
    processed: 'Refund Processed',
    completed: 'Return Completed',
    cancelled: 'Return Cancelled'
  };
  return statusTexts[status] || status;
};

export const getReturnReasonText = (reason) => {
  const reasonTexts = {
    damaged: 'Item Damaged',
    defective: 'Defective Product',
    wrong_item: 'Wrong Item Received',
    size_issue: 'Size Issue',
    quality_issue: 'Quality Issue',
    not_as_described: 'Not as Described',
    changed_mind: 'Changed Mind',
    duplicate_order: 'Duplicate Order',
    other: 'Other'
  };
  return reasonTexts[reason] || reason;
};

export const formatReturnNumber = (returnNumber) => {
  if (!returnNumber) return '';
  // Format like: RET-1234-5678
  return returnNumber.replace(/(.{3})(.{4})(.{4})/, '$1-$2-$3');
};
