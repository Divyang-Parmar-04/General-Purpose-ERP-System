import api from '../../service/api';

export const getMyAttendanceAPI = async () => {
    try {
        const response = await api.get("/api/employee/hr/attendence/get");
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch attendence"
        };
    }
};

export const markAttendanceAPI = async (action) => {
    try {
        const response = await api.post("/api/employee/hr/attendence/mark",action);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch attendence"
        };
    }
};


// Leaves : 

export const applyForLeaveAPI = async (action) => {
    try {
        const response = await api.post("/api/employee/hr/leaves/apply",action);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch Leaves"
        };
    }
};

export const getAllLeavesAPI = async () => {
    try {
        const response = await api.get("/api/employee/hr/leaves/get");
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch Leaves"
        };
    }
};

export const cancelLeaveAPI = async (id) => {
    try {
        const response = await api.patch(`/api/employee/hr/leaves/cancel/${id}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch Leaves"
        };
    }
};



