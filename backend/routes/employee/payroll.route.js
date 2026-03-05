const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const {
    handleGetMySalaryConfig,
    handleGetMySlips
} = require("../../controllers/employee/payroll.control");

router.get("/config", authMiddleware, employeeRoleMiddleware, handleGetMySalaryConfig);
router.get("/history", authMiddleware, employeeRoleMiddleware, handleGetMySlips);

module.exports = router;
