const express = require("express");
const { employeeRoleMiddleware } = require("../../middleware/role/employeeRoleMiddlware");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { markAttendance, getMyAttendance, handleApplyLeave, handleCancelLeave } = require("../../controllers/employee/hr.control");
const { handleGetLeaves } = require("../../controllers/admin/hr.control");
const router = express.Router()

// Attendence : 

router.get("/hr/attendence/get" , authMiddleware, employeeRoleMiddleware , getMyAttendance)
router.post("/hr/attendence/mark" ,authMiddleware,employeeRoleMiddleware ,markAttendance );

// Leaves : 

router.get("/hr/leaves/get" , authMiddleware , employeeRoleMiddleware , handleGetLeaves)
router.post("/hr/leaves/apply" , authMiddleware , employeeRoleMiddleware , handleApplyLeave)
router.patch("/hr/leaves/cancel/:leaveId" , authMiddleware , employeeRoleMiddleware , handleCancelLeave)

module.exports = router