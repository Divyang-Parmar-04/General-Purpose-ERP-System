const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { getAdminDashboardStats } = require("../../controllers/admin/dashboard.control");

// Get Admin Dashboard Stats
router.get("/dashboard", authMiddleware, userRoleMiddleware, getAdminDashboardStats);

module.exports = router;
