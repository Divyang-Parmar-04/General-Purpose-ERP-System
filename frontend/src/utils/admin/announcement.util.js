import api from "../../service/api";

export const createAnnouncementAPI = async (data) => {
    try {
        const response = await api.post("/api/admin/announcement/create", data);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to create announcement" };
    }
};

export const getAnnouncementsAPI = async (includeExpired = false) => {
    try {
        const response = await api.get(`/api/admin/announcement?includeExpired=${includeExpired}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to fetch announcements" };
    }
};

export const deleteAnnouncementAPI = async (id) => {
    try {
        const response = await api.delete(`/api/admin/announcement/${id}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to delete announcement" };
    }
};
