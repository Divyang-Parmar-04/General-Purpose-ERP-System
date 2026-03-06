
import api from "../../service/api";

export const getAllDepartmentsAPI = async () => {
    try {
        const res = await api.get("/api/admin/modules/departments")
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const createDepartmentAPI = async (data) => {
    try {
        const res = await api.post("/api/admin/modules/departments", data)
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const updateDepartmentAPI = async (id, data) => {
    try {
        const res = await api.put(`/api/admin/modules/departments/${id}`, data)
        return res.data
    } catch (error) {
        return error.response.data
    }
}

export const deleteDepartmentAPI = async (id) => {
    try {
        const res = await api.delete(`/api/admin/modules/departments/${id}`)
        return res.data
    } catch (error) {
        return error.response.data
    }
}