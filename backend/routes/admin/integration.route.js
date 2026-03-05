const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleGetIntegrations,
    handleToggleIntegration
} = require("../../controllers/admin/integration.control");

// Integration Routes
router.get("/", authMiddleware, userRoleMiddleware, handleGetIntegrations);
router.put("/:id/toggle", authMiddleware, userRoleMiddleware, handleToggleIntegration);

module.exports = router;
