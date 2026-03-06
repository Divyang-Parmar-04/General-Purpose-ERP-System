import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  LayoutDashboard,
  ListTodo,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { getEmployeeDashboardStats } from "../../../utils/employee/dashboard.util";

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployeeDashboardStats();
      if (res.success) {
        setDashboard(res.data);
      } else {
        throw new Error(res.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { tasks, attendance, leaves, projects, payroll } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8  sm:pt-8 space-y-6 sm:space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-600/10 rounded-lg">
              <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                My Dashboard
              </h1>
              <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Your personal workspace overview
              </p>
            </div>
          </div>

          <button
            onClick={fetchDashboard}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-gray-800 border dark:text-white border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
            Refresh
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Tasks Overview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">My Tasks</p>
              <ListTodo size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Assigned</span>
                <span className="font-bold dark:text-gray-200">{tasks.totalAssigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-bold text-amber-600">{tasks.pending}</span>
              </div>
              {tasks.overdue > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Overdue</span>
                  <span className="font-bold">{tasks.overdue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today</p>
              <Clock size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="space-y-2 text-xs sm:text-sm dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${attendance.todayStatus === "PRESENT" ? "bg-green-500" :
                    attendance.todayStatus === "ABSENT" ? "bg-red-500" :
                      attendance.todayStatus === "HALFDAY" ? "bg-yellow-500" :
                        attendance.todayStatus === "LEAVE" ? "bg-purple-500" :
                          "bg-gray-400"
                  }`} />
                <span className="font-bold capitalize">{attendance.todayStatus.toLowerCase().replace("_", " ")}</span>
              </div>
              {attendance.checkInTime && (
                <div className="text-gray-500">In: {format(parseISO(attendance.checkInTime), "hh:mm a")}</div>
              )}
              {attendance.checkOutTime && (
                <div className="text-gray-500">Out: {format(parseISO(attendance.checkOutTime), "hh:mm a")}</div>
              )}
            </div>
          </div>

          {/* Leaves */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leaves</p>
              <Calendar size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-purple-600 transition-colors" />
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between dark:text-gray-300 items-center">
                <span>Pending</span>
                <span className={`font-bold ${leaves.pendingRequests > 0 ? "text-amber-600" : ""}`}>
                  {leaves.pendingRequests}
                </span>
              </div>
              {leaves.upcomingLeave ? (
                <div className="text-[10px] text-purple-600 font-medium">
                  {format(parseISO(leaves.upcomingLeave.from), "dd MMM")} – {format(parseISO(leaves.upcomingLeave.to), "dd MMM")}
                </div>
              ) : (
                <div className="text-gray-400">None upcoming</div>
              )}
            </div>
          </div>

          {/* Payroll */}
          {payroll && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payroll</p>
                <Wallet size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-amber-600 transition-colors" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="text-gray-500">{payroll.month}/{payroll.year}</div>
                <div className="font-extrabold text-base sm:text-lg dark:text-white">
                  ₹{payroll.netPayable?.toLocaleString() || "—"}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${payroll.status === "PAID" ? "text-green-600" : "text-blue-600"
                  }`}>
                  {payroll.status}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks & Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* My Tasks */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 dark:text-gray-300">
              <ListTodo size={18} className="text-blue-600 sm:w-5 sm:h-5" />
              My Tasks (Top 5)
            </h2>
            {tasks.topTasks?.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.topTasks.map((task) => (
                  <div key={task._id} className="flex justify-between items-start py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">{task.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Due: {task.dueDate ? format(parseISO(task.dueDate), "dd MMM") : "No date"}
                      </p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${task.status === "COMPLETED" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                        task.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-500 italic">No tasks assigned</div>
            )}
          </div>

          {/* Active Projects */}
          {projects && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 dark:text-gray-300">
                <CheckCircle size={18} className="text-green-600 sm:w-5 sm:h-5" />
                Active Projects ({projects.activeCount})
              </h2>
              {projects.list?.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {projects.list.map((proj) => (
                    <div key={proj._id} className="flex justify-between items-center py-3 group">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-green-600 transition-colors">{proj.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Ends: {proj.endDate ? format(parseISO(proj.endDate), "dd MMM") : "TBD"}
                        </p>
                      </div>
                      <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${proj.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                        {proj.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-gray-500 italic">No active projects</div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Apply Leave
            </button>
            <button className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Clock In/Out
            </button>
            <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              View Payslip
            </button>
            <button className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
              Submit Expense
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default EmployeeDashboard;