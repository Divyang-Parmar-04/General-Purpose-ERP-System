import api from "../../service/api";

// Get salary configuration (structure)
export const getMySalaryConfig = async () => {
    const response = await api.get("/api/employee/payroll/config");
    return response.data;
};

// Get payment history (slips)
export const getMySalaryHistory = async (year) => {
    const query = year ? `?year=${year}` : "";
    const response = await api.get(`/api/employee/payroll/history${query}`);
    return response.data;
};
