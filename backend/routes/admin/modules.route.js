
const express = require("express");
const router = express.Router();

const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");

// Employees : 
const {
    handleGetAllEmployees,
    handleCreateEmployee,
    handleUpdateEmployee,
    handledeleteEmployee
} = require("../../controllers/admin/user.control");

// Departments : 
const {
    handleGetAllDepartments,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment
} = require("../../controllers/admin/department.control");


// Employees : 
router.get("/employees", authMiddleware, userRoleMiddleware, handleGetAllEmployees);
router.post("/employees", authMiddleware, userRoleMiddleware, handleCreateEmployee);
router.put("/employees/:id", authMiddleware, userRoleMiddleware, handleUpdateEmployee);
router.delete("/employees/:id", authMiddleware, userRoleMiddleware, handledeleteEmployee);


// Departments :
router.get("/departments", authMiddleware, userRoleMiddleware, handleGetAllDepartments);
router.post("/departments", authMiddleware, userRoleMiddleware, handleCreateDepartment);
router.put("/departments/:id", authMiddleware, userRoleMiddleware, handleUpdateDepartment);
router.delete("/departments/:id", authMiddleware, userRoleMiddleware, handleDeleteDepartment);


module.exports = router;