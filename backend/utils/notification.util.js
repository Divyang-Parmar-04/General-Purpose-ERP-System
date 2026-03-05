const Notification = require("../models/notification.model");
const { sendNotification } = require("./socket");

const createAndSendNotification = async ({ businessId, recipient, sender, title, message, type, relatedId }) => {
    try {
        const notification = await Notification.create({
            businessId,
            recipient,
            sender,
            title,
            message,
            type,
            relatedId
        });

        // Emit real-time socket event
        sendNotification(recipient, {
            _id: notification._id,
            title,
            message,
            type,
            relatedId,
            createdAt: notification.createdAt,
            isRead: false
        });

        return notification;
    } catch (error) {
        console.error("Error creating/sending notification:", error);
    }
};

module.exports = { createAndSendNotification };
