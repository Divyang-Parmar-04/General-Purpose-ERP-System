
const Announcement = require("../../models/announcement.model");
const { createAndSendNotification } = require("../../utils/notification.util");

const handleCreateAnnouncement = async (req, res) => {
    try {
        const userId = req.user._id;
        const businessId = req.user.businessId._id;
        const { title, content, type, targetAudience, expiryDate } = req.body;

        const announcement = await Announcement.create({
            businessId,
            title,
            content,
            type: type || "INFO",
            targetAudience: targetAudience || "ALL",
            createdBy: userId,
            expiryDate: expiryDate ? new Date(expiryDate) : null
        });

        // Notify Employees
        const User = require("../../models/user.model");

        const employees = await User.find({
            businessId,
            "role.name": "EMPLOYEE" // Adjusted based on role.name structure seen in other files
        });

        for (const emp of employees) {
            await createAndSendNotification({
                businessId,
                recipient: emp._id,
                sender: userId,
                title: "New Announcement",
                message: title,
                type: "ANNOUNCEMENT",
                relatedId: announcement._id
            });
        }

        res.status(201).json({ success: true, message: "Announcement created successfully", announcement });
    } catch (error) {
        console.error("Create Announcement Error:", error);
        res.status(500).json({ success: false, message: "Failed to create announcement" });
    }
};

const handleGetAnnouncements = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { includeExpired } = req.query;

        const query = { businessId, status: "ACTIVE" };
        if (!includeExpired) {
            query.$or = [
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ];
        }

        const announcements = await Announcement.find(query)
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error("Get Announcements Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch announcements" });
    }
};

const handleDeleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndUpdate(id, { status: "INACTIVE" });
        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Delete Announcement Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete announcement" });
    }
};

module.exports = {
    handleCreateAnnouncement,
    handleGetAnnouncements,
    handleDeleteAnnouncement
};
