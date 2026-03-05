
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { upload } = require("../../middleware/multer.middleware");

const {
    handleGetAllTasks,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask
} = require("../../controllers/admin/task.control");


router.get("/", authMiddleware, userRoleMiddleware, handleGetAllTasks);
router.post("/", authMiddleware, userRoleMiddleware, upload.array("documents", 5), handleCreateTask);
router.put("/:id", authMiddleware, userRoleMiddleware, upload.array("documents", 5), handleUpdateTask);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteTask);

module.exports = router;
