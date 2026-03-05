const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const {
    handleGetBusinessDocuments,
    handleGetDocumentById,
    handleGetFolders,
    handleGetDocumentTypes
} = require("../../controllers/employee/document.control");

// Document Routes
router.get("/", authMiddleware, employeeRoleMiddleware, handleGetBusinessDocuments);
router.get("/folders", authMiddleware, employeeRoleMiddleware, handleGetFolders);
router.get("/types", authMiddleware, employeeRoleMiddleware, handleGetDocumentTypes);
router.get("/:id", authMiddleware, employeeRoleMiddleware, handleGetDocumentById);

module.exports = router;
