import api from '../../service/api';

export const getTaxSummary = async () => {
    const response = await api.get("/api/admin/taxation/summary");
    return response.data;
};
