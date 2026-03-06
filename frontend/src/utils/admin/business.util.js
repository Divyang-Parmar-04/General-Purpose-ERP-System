
import api from '../../service/api'

export const createBusiness = async (data) => {
  try {
    const response = await api.post("/api/admin/business/create", data);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || "Failed to create business"
    };
  }
};

export const getBusinessAPI = async () => {
  try {
    const res = await api.get("/api/admin/business");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed to fetch business" };
  }
};

export const updateBusinessProfileAPI = async (data) => {
  try {
    const res = await api.put("/api/admin/business/profile", data);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed to update profile" };
  }
};

export const updateModulesAPI = async (data) => {
  try {
    const res = await api.put("/api/admin/business/modules", data);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed to update modules" };
  }
};

export const updateCurrencyAPI = async (data) => {
  try {
    const res = await api.put("/api/admin/business/currency", data);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed to update currency" };
  }
};

export const updateTaxSettingsAPI = async (data) => {
  try {
    const res = await api.put("/api/admin/business/tax", data);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: "Failed to update tax settings" };
  }
};