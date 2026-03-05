const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleGetCOA,
    handleGetGeneralLedger,
    handleGetBalanceSheet
} = require("../../controllers/admin/accounting.control");

// Accounting Routes
router.get("/coa", authMiddleware, userRoleMiddleware, handleGetCOA);
router.get("/ledger", authMiddleware, userRoleMiddleware, handleGetGeneralLedger);
router.get("/balance-sheet", authMiddleware, userRoleMiddleware, handleGetBalanceSheet);

module.exports = router;
