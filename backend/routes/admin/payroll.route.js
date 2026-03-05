const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleCreateStructure,
    handleGetStructures,
    handleAssignSalary,
    handleGetEmployeeSalaries,
    handleGeneratePayroll,
    handleGetSalarySlips,
    handleUpdateSlipStatus
} = require("../../controllers/admin/payroll.control");

// Structures
router.post("/structures", authMiddleware, userRoleMiddleware, handleCreateStructure);
router.get("/structures", authMiddleware, userRoleMiddleware, handleGetStructures);

// Employee Config
router.post("/employees/assign", authMiddleware, userRoleMiddleware, handleAssignSalary);
router.get("/employees", authMiddleware, userRoleMiddleware, handleGetEmployeeSalaries);

// Processing
router.post("/generate", authMiddleware, userRoleMiddleware, handleGeneratePayroll);
router.get("/slips", authMiddleware, userRoleMiddleware, handleGetSalarySlips);
router.put("/slips/:id/status", authMiddleware, userRoleMiddleware, handleUpdateSlipStatus);

module.exports = router;
