const express = require('express');
const router = express.Router();
const { employeeRoleMiddleware } = require('../../middleware/role/employeeRoleMiddlware');

const { authMiddleware } = require('../../middleware/auth/authMiddleware');
const { getMyTasks, updateMyTask, createTask } = require('../../controllers/employee/myTask.control');
const { upload } = require('../../middleware/multer.middleware');

// routes/employee.routes.js
router.get("/tasks", authMiddleware , employeeRoleMiddleware , getMyTasks);

router.put("/tasks/:id", authMiddleware , employeeRoleMiddleware , upload.array("documents", 5), updateMyTask);

router.post("/tasks", authMiddleware , employeeRoleMiddleware,upload.array("documents", 5), createTask);

module.exports = router