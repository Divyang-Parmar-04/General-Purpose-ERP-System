import api from '../../service/api';

export const getLeaves = async () => {
    const response = await api.get("/api/admin/hr/leaves");
    return response.data;
};

export const updateLeaveStatus = async (id, status) => {
    const response = await api.put(`/api/admin/hr/leaves/${id}`, { status });
    return response.data;
};

export const getAttendance = async (date = "") => {
    const response = await api.get(`/api/admin/hr/attendance${date ? `?date=${date}` : ''}`);
    return response.data;
};

export const getPayroll = async () => {
    const response = await api.get("/api/admin/hr/payroll");
    return response.data;
};


export const deleteLeave = async (id) => {
    const response = await api.delete(`/api/admin/hr/leave/delete/${id}`);
    return response.data;
};
