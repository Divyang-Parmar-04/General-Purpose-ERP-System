import api from '../../service/api';

export const getEmployeeDashboardStats = async () => {
    try {
        const response = await api.get("/api/employee/dashboard/stats");
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch dashboard statistics"
        };
    }
};
