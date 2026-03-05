const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleGetLeaves,
    handleUpdateLeaveStatus,
    handleGetAttendance,
    handleGetPayroll,
    handleDeleteCancelledLeaves
} = require("../../controllers/admin/hr.control");

// HR Routes (Admin only)
router.get("/leaves", authMiddleware, userRoleMiddleware, handleGetLeaves);
router.put("/leaves/:id", authMiddleware, userRoleMiddleware, handleUpdateLeaveStatus);
router.get("/attendance", authMiddleware, userRoleMiddleware, handleGetAttendance);
router.get("/payroll", authMiddleware, userRoleMiddleware, handleGetPayroll);
router.delete("/leave/delete/:id",authMiddleware,userRoleMiddleware,handleDeleteCancelledLeaves)

module.exports = router;
