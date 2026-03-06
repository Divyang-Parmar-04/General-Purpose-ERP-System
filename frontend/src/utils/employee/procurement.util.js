import api from "../../service/api";

// Get user's purchase requests
export const getMyPurchaseRequests = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);

    const response = await api.get(`/api/employee/procurement/requests?${params.toString()}`);
    return response.data;
};

// Get single purchase request details
export const getMyPurchaseRequestById = async (id) => {
    const response = await api.get(`/api/employee/procurement/requests/${id}`);
    return response.data;
};

// Create new purchase request
export const createPurchaseRequest = async (data) => {
    const response = await api.post("/api/employee/procurement/requests", data);
    return response.data;
};

// Update purchase request
export const updatePurchaseRequest = async (id, data) => {
    const response = await api.put(`/api/employee/procurement/requests/${id}`, data);
    return response.data;
};

// Delete purchase request
export const deletePurchaseRequest = async (id) => {
    const response = await api.delete(`/api/employee/procurement/requests/${id}`);
    return response.data;
};

// Cancel purchase request
export const cancelPurchaseRequest = async (id, reason) => {
    const response = await api.put(`/api/employee/procurement/requests/${id}/cancel`, { reason });
    return response.data;
};
