import { getDashboardStats } from '../utils/admin/dashboard.util';
import { createBusiness } from '../utils/admin/business.util';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../utils/admin/employee.util';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../utils/admin/department.util';
import { getAllTasksAPI as getTasks } from '../utils/admin/task.util'; // Standardizing name
import { getAllProjects, createProject, updateProject, deleteProject } from '../utils/admin/project.util';

/**
 * Admin Service - Centralized wrapper for admin utilities
 */
const AdminService = {
    // Dashboard
    getDashboardStats,

    // Business
    createBusiness,

    // Employees
    getEmployees: getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,

    // Departments
    getDepartments: getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Tasks
    getTasks,

    // Projects
    getProjects: getAllProjects,
    createProject,
    updateProject,
    deleteProject
};

export default AdminService;
