import api from "../../service/api";

// Get all inventory items
export const getInventory = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/api/employee/inventory?${params.toString()}`);
    return response.data;
};

// Get inventory item details
export const getInventoryItem = async (id) => {
    const response = await api.get(`/api/employee/inventory/${id}`);
    return response.data;
};

// Update stock (Add/Remove)
export const updateStock = async (id, data) => {
    // data: { quantity, type: 'ADD'|'REMOVE'|'SET', reason }
    const response = await api.put(`/api/employee/inventory/${id}/stock`, data);
    return response.data;
};

// Get categories
export const getCategories = async () => {
    const response = await api.get("/api/employee/inventory/categories");
    return response.data;
};
