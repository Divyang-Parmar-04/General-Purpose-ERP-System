const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { upload } = require("../../middleware/multer.middleware");
const {
    handleUploadDocument,
    handleGetDocuments,
    handleDeleteDocument
} = require("../../controllers/admin/document.control");

// Document Routes
router.get("/", authMiddleware, userRoleMiddleware, handleGetDocuments);
router.post("/upload", authMiddleware, userRoleMiddleware, upload.array("documents", 5), handleUploadDocument);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteDocument);

module.exports = router;
