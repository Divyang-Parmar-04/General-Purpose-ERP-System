import api from '../../service/api';

export const getSalesRecords = async () => {
    const response = await api.get("/api/admin/sales");
    return response.data;
};

export const createInvoice = async (data) => {
    const response = await api.post("/api/admin/sales", data);
    return response.data;
};

export const createInvoiceWithAttachments = async (formData) => {
    const response = await api.post("/api/admin/sales/with-attachments", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const updateInvoiceData = async (id, data) => {
    const response = await api.put(`/api/admin/sales/${id}`, data);
    return response.data;
};

export const deleteInvoice = async (id) => {
    const response = await api.delete(`/api/admin/sales/${id}`);
    return response.data;
};

export const updateInvoiceStatus = async (id, status) => {
    const response = await api.put(`/api/admin/sales/${id}/status`, { status });
    return response.data;
};
