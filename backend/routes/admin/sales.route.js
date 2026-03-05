const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {upload} = require("../../middleware/multer.middleware");
const {
    handleCreateInvoice,
    handleCreateInvoiceWithAttachments,
    handleGetSales,
    handleUpdateInvoiceStatus,
    handleUpdateInvoice,
    handleDeleteInvoice
} = require("../../controllers/admin/sales.control");

// Sales Routes
router.get("/", authMiddleware, userRoleMiddleware, handleGetSales);
router.post("/", authMiddleware, userRoleMiddleware, handleCreateInvoice);
router.post("/with-attachments", authMiddleware, userRoleMiddleware, upload.array("attachments", 10), handleCreateInvoiceWithAttachments);
router.put("/:id", authMiddleware, userRoleMiddleware, handleUpdateInvoice);
router.put("/:id/status", authMiddleware, userRoleMiddleware, handleUpdateInvoiceStatus);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteInvoice);

module.exports = router;
