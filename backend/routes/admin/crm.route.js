const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleCreateLead,
    handleGetLeads,
    handleUpdateLead,
    handleDeleteLead
} = require("../../controllers/admin/crm.control");

// CRM Routes
router.get("/leads", authMiddleware, userRoleMiddleware, handleGetLeads);
router.post("/leads", authMiddleware, userRoleMiddleware, handleCreateLead);
router.put("/leads/:id", authMiddleware, userRoleMiddleware, handleUpdateLead);
router.delete("/leads/:id", authMiddleware, userRoleMiddleware, handleDeleteLead);

module.exports = router;
