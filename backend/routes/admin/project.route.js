const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const {
    handleCreateProject,
    handleGetAllProjects,
    handleUpdateProject,
    handleDeleteProject
} = require("../../controllers/admin/project.control");

// Project Routes
router.get("/", authMiddleware, userRoleMiddleware, handleGetAllProjects);
router.post("/", authMiddleware, userRoleMiddleware, handleCreateProject);
router.put("/:id", authMiddleware, userRoleMiddleware, handleUpdateProject);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteProject);

module.exports = router;
