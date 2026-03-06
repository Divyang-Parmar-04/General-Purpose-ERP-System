import api from '../../service/api';

export const getAllLeads = async () => {
    const response = await api.get("/api/admin/crm/leads");
    return response.data;
};

export const createLead = async (data) => {
    const response = await api.post("/api/admin/crm/leads", data);
    return response.data;
};

export const updateLead = async (id, data) => {
    const response = await api.put(`/api/admin/crm/leads/${id}`, data);
    return response.data;
};

export const deleteLead = async (id) => {
    const response = await api.delete(`/api/admin/crm/leads/${id}`);
    return response.data;
};
