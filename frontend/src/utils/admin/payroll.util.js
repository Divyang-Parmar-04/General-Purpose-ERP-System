import api from "../../service/api";

// Structures
export const createStructure = async (data) => {
    const response = await api.post("/api/admin/payroll/structures", data);
    return response.data;
};

export const getStructures = async () => {
    const response = await api.get("/api/admin/payroll/structures");
    return response.data;
};

// Employee Assignment
export const assignSalary = async (data) => {
    const response = await api.post("/api/admin/payroll/employees/assign", data);
    return response.data;
};

export const getEmployeeSalaries = async () => {
    const response = await api.get("/api/admin/payroll/employees");
    return response.data;
};

// Payroll Processing
export const generatePayroll = async (data) => {
    // data: { month, year }
    const response = await api.post("/api/admin/payroll/generate", data);
    return response.data;
};

export const getSalarySlips = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/admin/payroll/slips?${params.toString()}`);
    return response.data;
};

export const updateSlipStatus = async (id, status) => {
    const response = await api.put(`/api/admin/payroll/slips/${id}/status`, { status });
    return response.data;
};
