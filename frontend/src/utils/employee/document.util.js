import api from "../../service/api";

export const getBusinessDocuments = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.documentType) params.append('documentType', filters.documentType);
    if (filters.folder) params.append('folder', filters.folder);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/api/employee/documents?${params.toString()}`);
    return response.data;
};

export const getDocumentById = async (id) => {
    const response = await api.get(`/api/employee/documents/${id}`);
    return response.data;
};

export const getFolders = async () => {
    const response = await api.get("/api/employee/documents/folders");
    return response.data;
};

export const getDocumentTypes = async () => {
    const response = await api.get("/api/employee/documents/types");
    return response.data;
};
