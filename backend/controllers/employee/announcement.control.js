const Announcement = require("../../models/announcement.model");

const handleGetEmployeeAnnouncements = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        // Find active announcements for this business that are not expired
        const query = {
            businessId,
            status: "ACTIVE",
            $or: [
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ]
        };

        const announcements = await Announcement.find(query)
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error("Get Employee Announcements Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch announcements" });
    }
};

module.exports = {
    handleGetEmployeeAnnouncements
};
