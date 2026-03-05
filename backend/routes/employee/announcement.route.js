const express = require("express");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { handleGetEmployeeAnnouncements } = require("../../controllers/employee/announcement.control");

const router = express.Router();

router.get("/get", authMiddleware, employeeRoleMiddleware, handleGetEmployeeAnnouncements);

module.exports = router;
