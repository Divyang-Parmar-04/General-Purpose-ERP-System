// controllers/employee/attendance.controller.js
const { Attendance, Leave } = require("../../models/hrms.model");


// Attendence : 

const getMyAttendance = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const businessId = req.user.businessId;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const today = await Attendance.findOne({
            employeeId,
            businessId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const history = await Attendance.find({
            employeeId,
            businessId
        })
            .sort({ date: -1 })
            .limit(30);

        res.status(200).json({
            success: true,
            data: {
                today,
                history
            }
        });
    } catch (error) {
        console.error("Get attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch attendance"
        });
    }
};

const markAttendance = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const businessId = req.user.businessId;

        const { action, location, remarks } = req.body;
        // action: "CHECK_IN" | "CHECK_OUT"

        if (!["CHECK_IN", "CHECK_OUT"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance action"
            });
        }

        // Normalize date to start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            businessId,
            employeeId,
            date: today
        });

        /* ====================== CHECK IN ====================== */
        if (action === "CHECK_IN") {
            // Create attendance if not exists
            if (!attendance) {
                attendance = await Attendance.create({
                    businessId,
                    employeeId,
                    date: today,
                    sessions: [
                        {
                            clockIn: new Date(),
                            location
                        }
                    ],
                    status: "PRESENT",
                    source: "WEB",
                    remarks
                });

                return res.status(200).json({
                    success: true,
                    message: "Checked in successfully",
                    data: attendance
                });
            }

            const lastSession = attendance.sessions.at(-1);

            if (lastSession && !lastSession.clockOut) {
                return res.status(400).json({
                    success: false,
                    message: "Already checked in. Please check out first."
                });
            }

            attendance.sessions.push({
                clockIn: new Date(),
                location
            });

            await attendance.save();

            return res.status(200).json({
                success: true,
                message: "Checked in successfully",
                data: attendance
            });
        }

        /* ====================== CHECK OUT ====================== */
        if (action === "CHECK_OUT") {
            if (!attendance || attendance.sessions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No active check-in found"
                });
            }

            const lastSession = attendance.sessions.at(-1);

            if (lastSession.clockOut) {
                return res.status(400).json({
                    success: false,
                    message: "Already checked out"
                });
            }

            lastSession.clockOut = new Date();

            // Calculate total work minutes
            let totalMinutes = 0;

            attendance.sessions.forEach((session) => {
                if (session.clockIn && session.clockOut) {
                    const diff =
                        (new Date(session.clockOut) - new Date(session.clockIn)) / 60000;
                    totalMinutes += Math.floor(diff);
                }
            });

            attendance.totalWorkMinutes = totalMinutes;
            attendance.remarks = remarks || attendance.remarks;

            await attendance.save();

            return res.status(200).json({
                success: true,
                message: "Checked out successfully",
                data: attendance
            });
        }
    } catch (error) {
        console.error("Attendance Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark attendance"
        });
    }
};


// Leaves : 


const handleGetMyLeaves = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const businessId = req.user.businessId;

        const leaves = await Leave.find({
            employeeId,
            businessId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });

    } catch (error) {
        console.error("Get My Leaves Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leaves"
        });
    }
};

const handleApplyLeave = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const businessId = req.user.businessId;


        const {
            startDate,
            endDate,
            leaveType,
            duration,
            reason
        } = req.body;

        // console.log(leaveType)


        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        const leave = await Leave.create({
            businessId,
            employeeId,
            startDate,
            leaveType,
            endDate,
            duration,
            reason
        });

        // console.log(leave)

        return res.status(201).json({
            success: true,
            message: "Leave request submitted",
            data: leave
        });

    } catch (error) {
        console.error("Apply Leave Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to apply leave"
        });
    }
};

const handleCancelLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const employeeId = req.user._id;

        const leave = await Leave.findOne({
            _id: leaveId,
            employeeId
        });


        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found"
            });
        }

        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending leave can be cancelled"
            });
        }

        leave.status = "CANCELLED";
        await leave.save();

        return res.status(200).json({
            success: true,
            message: "Leave cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Leave Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel leave"
        });
    }
};


module.exports = { getMyAttendance, markAttendance, handleGetMyLeaves, handleApplyLeave, handleCancelLeave };
