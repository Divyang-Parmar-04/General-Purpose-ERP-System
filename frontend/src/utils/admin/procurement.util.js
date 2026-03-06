import api from '../../service/api';

export const getVendors = async () => {
    const response = await api.get("/api/admin/procurement/vendors");
    return response.data;
};

export const createVendor = async (data) => {
    const response = await api.post("/api/admin/procurement/vendors", data);
    return response.data;
};

export const updateVendor = async (id, data) => {
    const response = await api.put(`/api/admin/procurement/vendors/${id}`, data);
    return response.data;
};

export const deleteVendor = async (id) => {
    const response = await api.delete(`/api/admin/procurement/vendors/${id}`);
    return response.data;
};

export const getPurchaseOrders = async () => {
    const response = await api.get("/api/admin/procurement/orders");
    return response.data;
};

export const getPurchaseOrderById = async (id) => {
    const response = await api.get(`/api/admin/procurement/orders/${id}`);
    return response.data;
};

export const updatePOStatus = async (id, status) => {
    const response = await api.put(`/api/admin/procurement/orders/${id}/status`, { status });
    return response.data;
};


// PR Routes

export const getPurchaseRequests = async () => {
    const response = await api.get("/api/admin/procurement/requests");
    return response.data;
};

export const getPurchaseRequestById = async (id) => {
    const response = await api.get(`/api/admin/procurement/requests/${id}`);
    return response.data;
};

export const createPurchaseRequest = async (data) => {
    const response = await api.post("/api/admin/procurement/requests", data);
    return response.data;
};

export const updatePurchaseRequest = async (id, data) => {
    const response = await api.put(`/api/admin/procurement/requests/${id}`, data);
    return response.data;
};

export const approvePurchaseRequest = async (id) => {
    const response = await api.put(`/api/admin/procurement/requests/${id}/approve`);
    return response.data;
};  

export const rejectPurchaseRequest = async (id) => {
    const response = await api.put(`/api/admin/procurement/requests/${id}/reject`);
    return response.data;
};

export const convertToPurchaseOrder = async (id, data) => {
    const response = await api.post(`/api/admin/procurement/requests/${id}/convert-to-po`, data);
    return response.data;
};

export const deletePurchaseRequest = async (id) => {
    const response = await api.delete(`/api/admin/procurement/requests/${id}`);
    return response.data;
};

export const cancelPurchaseRequest = async (id) => {
    const response = await api.put(`/api/admin/procurement/requests/${id}/cancel`);
    return response.data;
};
