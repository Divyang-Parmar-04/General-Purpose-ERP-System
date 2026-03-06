import api from '../../service/api';

export const getReportSummary = async () => {
    const response = await api.get("/api/admin/reports/summary");
    return response.data;
};

export const fetchReportData = async (payload) => {
    const response = await api.post('/api/admin/reports/fetch-data', payload);
    return response.data;
};

export const generateReport = async (payload) => {
    const response = await api.post('/api/admin/reports/generate', payload);
    return response.data;
};

export const generateReportPDF = async (payload) => {
    const response = await api.post('/api/admin/reports/generate/pdf', payload, { responseType: 'blob' });
    return response.data;
};

export const saveReport = async (payload) => {
    const response = await api.post('/api/admin/reports/save', payload);
    return response.data;
};

export const getSavedReports = async (type = 'ALL') => {
    const response = await api.get(`/api/admin/reports/saved?type=${type}`);
    return response.data;
};

export const getReportById = async (id) => {
    const response = await api.get(`/api/admin/reports/saved/${id}`);
    return response.data;
};

export const deleteReport = async (id) => {
    const response = await api.delete(`/api/admin/reports/saved/${id}`);
    return response.data;
};
