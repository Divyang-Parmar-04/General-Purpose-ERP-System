const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleGetAccounts,
    handleCreateAccount,
    handleDeleteAccount,
    handleGetTransactions,
    handleCreateTransaction
} = require("../../controllers/admin/finance.control");

// Account Routes
router.get("/accounts", authMiddleware, userRoleMiddleware, handleGetAccounts);
router.post("/accounts", authMiddleware, userRoleMiddleware, handleCreateAccount);
router.delete("/accounts/:id", authMiddleware, userRoleMiddleware, handleDeleteAccount);

// Transaction Routes
router.get("/transactions", authMiddleware, userRoleMiddleware, handleGetTransactions);
router.post("/transactions", authMiddleware, userRoleMiddleware, handleCreateTransaction);

module.exports = router;
