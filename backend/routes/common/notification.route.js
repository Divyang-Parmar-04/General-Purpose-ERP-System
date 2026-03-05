const express = require("express");
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { handleGetNotifications, handleMarkAsRead } = require("../../controllers/common/notification.control");

const router = express.Router();

router.get("/get", authMiddleware, handleGetNotifications);
router.patch("/mark-read/:id", authMiddleware, handleMarkAsRead);

module.exports = router;
