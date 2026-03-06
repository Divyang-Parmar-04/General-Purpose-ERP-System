import api from '../../service/api';

export const getAccounts = async () => {
    const response = await api.get("/api/admin/finance/accounts");
    return response.data;
};

export const createAccount = async (data) => {
    const response = await api.post("/api/admin/finance/accounts", data);
    return response.data;
};

export const deleteAccount = async (id) => {
    const response = await api.delete(`/api/admin/finance/accounts/${id}`);
    return response.data;
};

export const getTransactions = async () => {
    const response = await api.get("/api/admin/finance/transactions");
    return response.data;
};

export const createTransaction = async (data) => {
    const response = await api.post("/api/admin/finance/transactions", data);
    return response.data;
};
