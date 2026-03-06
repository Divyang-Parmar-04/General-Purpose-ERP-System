import api from '../../service/api';

export const getDocuments = async () => {
    const response = await api.get("/api/admin/documents");
    return response.data;
};

export const uploadDocuments = async (formData) => {
    const response = await api.post("/api/admin/documents/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/api/admin/documents/${id}`);
    return response.data;
};
