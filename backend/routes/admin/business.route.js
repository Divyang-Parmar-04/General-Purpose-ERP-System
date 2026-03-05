
const express = require("express");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { handleCreateNewBusiness, handleGetBusiness, handleUpdateBusinessProfile, handleUpdateModules, handleUpdateCurrency, handleUpdateTaxSettings } = require("../../controllers/admin/business.control");

const router = express.Router()

// Business : 

router.get("/business", authMiddleware, userRoleMiddleware, handleGetBusiness)
router.post("/business/create", authMiddleware, userRoleMiddleware, handleCreateNewBusiness)

router.put("/business/profile", authMiddleware, userRoleMiddleware, handleUpdateBusinessProfile)
router.put("/business/modules", authMiddleware, userRoleMiddleware, handleUpdateModules)
router.put("/business/currency", authMiddleware, userRoleMiddleware, handleUpdateCurrency)
router.put("/business/tax", authMiddleware, userRoleMiddleware, handleUpdateTaxSettings)

module.exports = router