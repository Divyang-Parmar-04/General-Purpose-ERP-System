import api from '../../service/api';

export const getNotificationsAPI = async () => {
    try {
        const response = await api.get("/api/notifications/get");
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch notifications"
        };
    }
};

export const markAsReadAPI = async (id) => {
    try {
        const response = await api.patch(`/api/notifications/mark-read/${id}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update notification"
        };
    }
};
