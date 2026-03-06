// utils/employee/task.util.js
import api from "../../service/api";

const BASE_URL = "/api/employee/tasks"; 

// 1. Get all tasks assigned to the current logged-in employee

export const getMyTasksAPI = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response.data; // expected: { success: true, count: number, data: [tasks] }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 2. Update my own task (mainly status + add/remove documents)
export const updateMyTaskAPI = async (taskId, formData) => {
  try {
    const response = await api.put(`${BASE_URL}/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // expected: { success: true, data: updatedTask }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 3. Create a new task (only available if user has "create_task" permission)
export const createTaskAPI = async (formData) => {
  try {
    const response = await api.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // expected: { success: true, data: [createdTasks] }
  } catch (error) {
    throw error.response?.data || error;
  }
};