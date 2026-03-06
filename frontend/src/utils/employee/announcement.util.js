import api from '../../service/api';

export const getEmployeeAnnouncementsAPI = async () => {
    try {
        const response = await api.get("/api/employee/announcements/get");
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch announcements"
        };
    }
};
