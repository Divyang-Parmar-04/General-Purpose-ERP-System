import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Clock,
  Play,
  StopCircle,
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  markAttendanceAPI,
  getMyAttendanceAPI,
} from "../../../utils/employee/hr.util";

const EmployeeAttendance = () => {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendanceAPI();
      if (res.success) {
        setToday(res.data.today);
        setHistory(res.data.history || []);
      } else {
        toast.error(res.message || "Failed to load attendance");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      const res = await markAttendanceAPI({ action });
      if (res.success) {
        toast.success(res.message || `Successfully ${action.toLowerCase()}ed`);
        fetchAttendance();
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const activeSession = today?.sessions?.find((s) => !s.clockOut) || null;

  const formatTime = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
  };

  const formatMinutes = (minutes) => {
    if (!minutes) return "0h 0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "PRESENT":
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case "ABSENT":
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case "HALFDAY":
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300`;
      case "LEAVE":
        return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300`;
      case "HOLIDAY":
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950  md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Clock className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Attendance
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your daily check-in & work hours
              </p>
            </div>
          </div>

          <button
            onClick={fetchAttendance}
            disabled={loading || actionLoading}
            className="flex items-center gap-2 px-4 dark:text-white py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading || actionLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Today's Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Today's Status</p>
            <div className="flex items-center gap-3">
              <span className={getStatusBadge(today?.status || "NOT_MARKED")}>
                {today?.status || "Not Marked"}
              </span>
            </div>
          </div>

          {/* Total Work Time */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Work Time</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMinutes(today?.totalWorkMinutes)}
            </p>
          </div>

          {/* Check In / Out Action */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex items-center justify-center">
            {!activeSession ? (
              <button
                onClick={() => handleAction("CHECK_IN")}
                disabled={actionLoading || loading}
                className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Play size={20} />
                Check In
              </button>
            ) : (
              <button
                onClick={() => handleAction("CHECK_OUT")}
                disabled={actionLoading || loading}
                className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <StopCircle size={20} />
                Check Out
              </button>
            )}
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Clock size={20} className="text-blue-600" />
            Today's Sessions
          </h2>

          {today?.sessions?.length > 0 ? (
            <div className="space-y-4">
              {today.sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Session {idx + 1}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        In: {formatTime(session.clockIn)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Out: {session.clockOut ? formatTime(session.clockOut) : "Still Active"}
                    </p>
                    {session.clockOut && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Duration: {formatMinutes(session.durationMinutes || 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-40" />
              <p>No sessions recorded today</p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <CalendarDays size={20} className="text-purple-600" />
            Attendance History
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={28} className="animate-spin text-blue-600 mr-3" />
              <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarDays size={48} className="mx-auto mb-4 opacity-40" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Work Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {history.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                        {new Date(record.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadge(record.status)}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                        {formatMinutes(record.totalWorkMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;