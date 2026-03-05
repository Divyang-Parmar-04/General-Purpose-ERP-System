// routes/employee.routes.js
const express = require('express');
const router = express.Router();
const { employeeRoleMiddleware } = require('../../middleware/role/employeeRoleMiddlware');
const {getEmployeeDashboard} = require('../../controllers/employee/dashboard.control')
const { authMiddleware } = require('../../middleware/auth/authMiddleware');

// Assuming only logged-in users can access their own dashboard
router.get('/dashboard/stats', authMiddleware, employeeRoleMiddleware, getEmployeeDashboard);

module.exports = router;