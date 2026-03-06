import api from '../../service/api';

// Get All Inventory Items
export const getInventory = async (filters = {}) => {
    try {
        const response = await api.get("/api/admin/inventory", { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create Inventory Item with Images
export const createInventoryItemAPI = async (formData) => {
    try {
        const response = await api.post("/api/admin/inventory", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get Single Inventory Item
export const getInventoryItem = async (id) => {
    try {
        const response = await api.get(`/api/admin/inventory/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update Inventory Item
export const updateInventoryItem = async (id, formData) => {
    try {
        const response = await api.put(`/api/admin/inventory/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete Inventory Item
export const deleteInventoryItem = async (id) => {
    try {
        const response = await api.delete(`/api/admin/inventory/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==================== STOCK MANAGEMENT ====================

// Get Stock Details
export const getStock = async (itemId) => {
    try {
        const response = await api.get(`/api/admin/inventory/${itemId}/stock`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update Stock Level
export const updateStock = async (id, stockData) => {
    try {
        const response = await api.put(`/api/admin/inventory/${id}/stock`, stockData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get Low Stock Items
export const getLowStockItems = async () => {
    try {
        const response = await api.get("/api/admin/inventory/stock/low-stock/alerts");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};


// ==================== LEGACY COMPATIBILITY ====================
// These functions are maintained for backward compatibility

export const createItem = async (data) => {
    return createInventoryItemAPI(data);
};
