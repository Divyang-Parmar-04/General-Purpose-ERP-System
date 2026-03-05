const express = require("express");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const {
    handleCreateAnnouncement,
    handleGetAnnouncements,
    handleDeleteAnnouncement
} = require("../../controllers/admin/announcement.control");

const router = express.Router();

router.post("/create", authMiddleware, userRoleMiddleware, handleCreateAnnouncement);
router.get("/", authMiddleware, handleGetAnnouncements);
router.delete("/:id", authMiddleware, userRoleMiddleware, handleDeleteAnnouncement);

module.exports = router;
