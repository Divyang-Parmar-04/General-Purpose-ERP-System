const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleCreateItem,
    handleGetInventory,
    handleGetInventoryItem,
    handleUpdateItem,
    handleUpdateStock,
    handleDeleteItem,
    handleGetStock,
    handleGetLowStockItems
} = require("../../controllers/admin/inventory.control");

// Multer configuration for image uploads
const upload = multer({
    dest: "public/temp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

// Inventory Item Routes
router.get("/", authMiddleware, userRoleMiddleware, handleGetInventory);
router.post("/", authMiddleware, userRoleMiddleware, upload.array("images", 5), handleCreateItem);
router.get("/:id", authMiddleware, userRoleMiddleware, handleGetInventoryItem);
router.put("/:id", authMiddleware, userRoleMiddleware, upload.array("images", 5), handleUpdateItem);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteItem);

// Stock Management Routes
router.get("/:id/stock", authMiddleware, userRoleMiddleware, handleGetStock);
router.put("/:id/stock", authMiddleware, userRoleMiddleware, handleUpdateStock);
router.get("/stock/low-stock/alerts", authMiddleware, userRoleMiddleware, handleGetLowStockItems);

module.exports = router;
