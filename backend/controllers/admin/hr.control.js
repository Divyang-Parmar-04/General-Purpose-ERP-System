const { Leave, Attendance, Payroll } = require("../../models/hrms.model");

// ================== LEAVE MANAGEMENT ==================

// Get all leave requests for a business
const handleGetLeaves = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const leaves = await Leave.find({ businessId })
            .populate("employeeId", "name email")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: leaves
        });
    } catch (error) {
        console.error("Get Leaves Error:", error);
        res.status(500).json({ success: false, message: "Error fetching leaves" });
    }
};

// Update leave status (Approve/Reject)
const handleUpdateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const leave = await Leave.findByIdAndUpdate(
            id,
            { status, approvedBy: req.user._id },
            { new: true }
        );

        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

        // Notify Employee
        const { createAndSendNotification } = require("../../utils/notification.util");
        await createAndSendNotification({
            businessId: req.user.businessId._id,
            recipient: leave.employeeId,
            sender: req.user._id,
            title: "Leave Request Update",
            message: `Your leave request has been ${status.toLowerCase()}`,
            type: "LEAVE",
            relatedId: leave._id
        });

        res.status(200).json({
            success: true,
            message: `Leave ${status.toLowerCase()} successfully`,
            data: leave
        });
    } catch (error) {
        console.error("Update Leave Error:", error);
        res.status(500).json({ success: false, message: "Error updating leave status" });
    }
};

// Delete Cancelled Leaves 

const handleDeleteCancelledLeaves = async (req, res) => {
    try {

        const {id} = req.params
        
        await Leave.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: `Leave Deleted successfully`,
        });
    } catch (error) {
        console.error("Delete Leave Error:", error);
        res.status(500).json({ success: false, message: "Error Deleting leave" });
    }
}

// ================== ATTENDANCE MANAGEMENT ==================

// Get attendance records
const handleGetAttendance = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { date } = req.query; // Optional: filter by date

        let query = { businessId };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const attendance = await Attendance.find(query)
            .populate("employeeId", "name email")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error("Get Attendance Error:", error);
        res.status(500).json({ success: false, message: "Error fetching attendance" });
    }
};

// ================== PAYROLL MANAGEMENT ==================

// Get payroll records
const handleGetPayroll = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const payroll = await Payroll.find({ businessId })
            .populate("employeeId", "name email")
            .sort({ year: -1, month: -1 });

        res.status(200).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        console.error("Get Payroll Error:", error);
        res.status(500).json({ success: false, message: "Error fetching payroll" });
    }
};

module.exports = {
    handleGetLeaves,
    handleUpdateLeaveStatus,
    handleGetAttendance,
    handleGetPayroll,
    handleDeleteCancelledLeaves
};
