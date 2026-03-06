
import api from "../../service/api";

export const getAllEmployeesAPI = async () => {
    try {
        const res = await api.get("/api/admin/modules/employees")
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const createEmployeeAPI = async (data) => {
    try {
        const res = await api.post("/api/admin/modules/employees", data)
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const updateEmployeeAPI = async (id, data) => {
    try {
        const res = await api.put(`/api/admin/modules/employees/${id}`, data)
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const deleteEmployeeAPI = async (id) => {
    const res = await api.delete(`/api/admin/modules/employees/${id}`);
    return res.data;
};

export const updateUserProfileAPI = async (data) => {
    try {
        const res = await api.put("/api/auth/user/profile", data);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Failed to update profile" };
    }
};
