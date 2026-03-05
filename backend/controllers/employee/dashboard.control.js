const mongoose = require("mongoose");
const Project = require("../../models/project.model");
const { Attendance, Leave, Payroll } = require("../../models/hrms.model");
const Task = require("../../models/task.model");

// const Announcement = require("../../models/Announcement");

const getEmployeeDashboard = async (req, res) => {
  try {
    const user = req.user; 
    const employeeId = user._id;
    const businessId = user.businessId;
    const enabledModules = user.role?.modules || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queries = [];

    /* ================= TASKS (CORE) ================= */
    queries.push(
      Task.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            assignedTo: employeeId
          }
        },
        {
          $facet: {
            counts: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            topTasks: [
              { $sort: { dueDate: 1, priority: -1 } },
              { $limit: 5 },
              {
                $project: {
                  title: 1,
                  status: 1,
                  dueDate: 1,
                  priority: 1,
                  projectId: 1
                }
              }
            ]
          }
        }
      ])
    );

    /* ================= ATTENDANCE (CORE) ================= */
    queries.push(
      Attendance.findOne({
        businessId,
        employeeId,
        date: today
      }).lean()
    );

    /* ================= LEAVES (CORE) ================= */
    queries.push(
      Leave.find({
        businessId,
        employeeId,
        status: "PENDING"
      }).countDocuments()
    );

    queries.push(
      Leave.findOne({
        businessId,
        employeeId,
        status: "APPROVED",
        startDate: { $gte: today }
      })
        .sort({ startDate: 1 })
        .lean()
    );

    // /* ================= ANNOUNCEMENTS (CORE) ================= */
    // queries.push(
    //   Announcement
    //     ? Announcement.find({ businessId })
    //         .sort({ createdAt: -1 })
    //         .limit(3)
    //         .select("title priority createdAt")
    //         .lean()
    //     : Promise.resolve([])
    // );

    /* ================= PROJECTS (OPTIONAL) ================= */
    if (enabledModules.includes("projects")) {
      queries.push(
        Project.find({
          businessId,
          "members.user": employeeId,
          status: { $ne: "COMPLETED" }
        })
          .select("name endDate status")
          .limit(5)
          .lean()
      );
    } else {
      queries.push(Promise.resolve(null));
    }

    /* ================= PAYROLL (OPTIONAL) ================= */
    if (enabledModules.includes("payroll") || enabledModules.includes("finance")) {
      queries.push(
        Payroll.findOne({
          businessId,
          employeeId
        })
          .sort({ year: -1, month: -1 })
          .select("month year netPayable paymentStatus")
          .lean()
      );
    } else {
      queries.push(Promise.resolve(null));
    }

    /* ================= EXECUTE ALL ================= */
    const [
      taskAgg,
      todayAttendance,
      pendingLeaves,
      upcomingLeave,
      announcements,
      projects,
      payroll
    ] = await Promise.all(queries);

    /* ================= FORMAT TASKS ================= */
    const taskCounts = {};
    taskAgg?.[0]?.counts?.forEach(c => {
      taskCounts[c._id] = c.count;
    });

    const response = {
      tasks: {
        totalAssigned: Object.values(taskCounts).reduce((a, b) => a + b, 0),
        pending: taskCounts["PENDING"] || 0,
        overdue: taskCounts["OVERDUE"] || 0,
        topTasks: taskAgg?.[0]?.topTasks || []
      },

      attendance: {
        todayStatus: todayAttendance?.status || "NOT_MARKED",
        checkInTime: todayAttendance?.sessions?.[0]?.clockIn || null,
        checkOutTime: todayAttendance?.sessions?.slice(-1)?.[0]?.clockOut || null,
        workingMinutes: todayAttendance?.totalWorkMinutes || 0
      },

      leaves: {
        pendingRequests: pendingLeaves,
        upcomingLeave: upcomingLeave
          ? {
              from: upcomingLeave.startDate,
              to: upcomingLeave.endDate
            }
          : null
      },

      // announcements,

      projects: projects
        ? {
            activeCount: projects.length,
            list: projects
          }
        : undefined,

      payroll: payroll
        ? {
            month: payroll.month,
            year: payroll.year,
            netPayable: payroll.netPayable,
            status: payroll.paymentStatus
          }
        : undefined
    };

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load employee dashboard"
    });
  }
};

module.exports = {getEmployeeDashboard}
