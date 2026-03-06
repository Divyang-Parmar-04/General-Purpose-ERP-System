import api from '../../service/api';

export const getAllProjects = async () => {
    const response = await api.get("/api/admin/projects");
    return response.data;
};

export const createProject = async (data) => {
    const response = await api.post("/api/admin/projects", data);
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await api.put(`/api/admin/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/api/admin/projects/${id}`);
    return response.data;
};
