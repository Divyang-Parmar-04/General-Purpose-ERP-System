import api from '../../service/api';

export const getCOA = async () => {
    const response = await api.get("/api/admin/accounting/coa");
    return response.data;
};

export const getGeneralLedger = async () => {
    const response = await api.get("/api/admin/accounting/ledger");
    return response.data;
};

export const getBalanceSheet = async () => {
    const response = await api.get("/api/admin/accounting/balance-sheet");
    return response.data;
};
