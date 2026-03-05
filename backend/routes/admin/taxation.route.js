const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { handleGetTaxSummary } = require("../../controllers/admin/taxation.control");

// Taxation Routes
router.get("/summary", authMiddleware, userRoleMiddleware, handleGetTaxSummary);

module.exports = router;
