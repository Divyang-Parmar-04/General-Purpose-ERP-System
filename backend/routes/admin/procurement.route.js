const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleGetVendors,
    handleCreateVendor,
    handleUpdateVendor,
    handleDeleteVendor,
    handleGetPOs,
    handleGetPOById,
    handleCreatePO,
    handleUpdatePOStatus,
    handleGetPurchaseRequests,
    handleGetPurchaseRequestById,
    handleApprovePurchaseRequest,
    handleRejectPurchaseRequest,
    handleConvertToPurchaseOrder
} = require("../../controllers/admin/procurement.control");

// Vendor Routes
router.get("/vendors", authMiddleware, userRoleMiddleware, handleGetVendors);
router.post("/vendors", authMiddleware, userRoleMiddleware, handleCreateVendor);
router.put("/vendors/:id", authMiddleware, userRoleMiddleware, handleUpdateVendor);
router.delete("/vendors/:id", authMiddleware, userRoleMiddleware, handleDeleteVendor);

// PO Routes
router.get("/orders", authMiddleware, userRoleMiddleware, handleGetPOs);
router.get("/orders/:id", authMiddleware, userRoleMiddleware, handleGetPOById);
router.post("/orders", authMiddleware, userRoleMiddleware, handleCreatePO);
router.put("/orders/:id/status", authMiddleware, userRoleMiddleware, handleUpdatePOStatus);

// PR Routes (Admin: View, Approve, Reject, Convert only)
router.get("/requests", authMiddleware, userRoleMiddleware, handleGetPurchaseRequests);
router.get("/requests/:id", authMiddleware, userRoleMiddleware, handleGetPurchaseRequestById);
router.put("/requests/:id/approve", authMiddleware, userRoleMiddleware, handleApprovePurchaseRequest);
router.put("/requests/:id/reject", authMiddleware, userRoleMiddleware, handleRejectPurchaseRequest);
router.post("/requests/:id/convert-to-po", authMiddleware, userRoleMiddleware, handleConvertToPurchaseOrder);

module.exports = router;
