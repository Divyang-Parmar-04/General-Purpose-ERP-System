const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const {
    handleGetMyPurchaseRequests,
    handleGetMyPurchaseRequestById,
    handleCreatePurchaseRequest,
    handleUpdatePurchaseRequest,
    handleDeletePurchaseRequest,
    handleCancelPurchaseRequest
} = require("../../controllers/employee/procurement.control");

// Purchase Request Routes for Employees
router.get("/requests", authMiddleware, employeeRoleMiddleware, handleGetMyPurchaseRequests);
router.get("/requests/:id", authMiddleware, employeeRoleMiddleware, handleGetMyPurchaseRequestById);
router.post("/requests", authMiddleware, employeeRoleMiddleware, handleCreatePurchaseRequest);
router.put("/requests/:id", authMiddleware, employeeRoleMiddleware, handleUpdatePurchaseRequest);
router.delete("/requests/:id", authMiddleware, employeeRoleMiddleware, handleDeletePurchaseRequest);
router.put("/requests/:id/cancel", authMiddleware, employeeRoleMiddleware, handleCancelPurchaseRequest);

module.exports = router;
