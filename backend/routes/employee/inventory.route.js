const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const {
    handleGetInventory,
    handleGetInventoryItem,
    handleUpdateStock,
    handleGetCategories
} = require("../../controllers/employee/inventory.control");

router.get("/", authMiddleware, employeeRoleMiddleware, handleGetInventory);
router.get("/categories", authMiddleware, employeeRoleMiddleware, handleGetCategories);
router.get("/:id", authMiddleware, employeeRoleMiddleware, handleGetInventoryItem);
router.put("/:id/stock", authMiddleware, employeeRoleMiddleware, handleUpdateStock);

module.exports = router;
