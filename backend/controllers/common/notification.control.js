const Notification = require("../../models/notification.model");

const handleGetNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

const handleMarkAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (id === "all") {
            await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        } else {
            await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true });
        }

        res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark as Read Error:", error);
        res.status(500).json({ success: false, message: "Failed to update notification" });
    }
};

module.exports = {
    handleGetNotifications,
    handleMarkAsRead
};
