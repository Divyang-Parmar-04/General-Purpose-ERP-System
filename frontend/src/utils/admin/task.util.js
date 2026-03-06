
import api from "../../service/api";

const BASE_URL = "/api/admin/tasks";

export const getAllTasksAPI = async () => {
    try {
        const response = await api.get(BASE_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createTaskAPI = async (formData) => {
    try {
        const response = await api.post(BASE_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateTaskAPI = async (id, formData) => {
    try {
        const response = await api.put(`${BASE_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteTaskAPI = async (id) => {
    try {
        const response = await api.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
