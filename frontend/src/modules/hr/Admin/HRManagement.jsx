import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  UserCog,
  Trash,
  Trash2Icon,
} from "lucide-react";
import PayrollManagement from "../components/PayrollManagement";
import toast from "react-hot-toast";
import { getLeaves, getAttendance, getPayroll, updateLeaveStatus, deleteLeave } from "../../../utils/admin/hr.util";

function HRManagement() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("LEAVES");

  const fetchData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === "LEAVES") result = await getLeaves();
      else if (activeTab === "ATTENDANCE") result = await getAttendance();
      else if (activeTab === "PAYROLL") result = await getPayroll();

      if (result?.success) {
        setData(result.data || []);
      } else {
        toast.error(result?.message || `Failed to load ${activeTab.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Fetch ${activeTab} Error:`, error);
      toast.error(`Failed to load ${activeTab.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleLeaveStatus = async (id, status) => {
    if (!window.confirm(`Mark this leave as ${status.toLowerCase()}?`)) return;

    try {
      const result = await updateLeaveStatus(id, status);
      if (result.success) {
        toast.success(`Leave ${status.toLowerCase()}`);
        fetchData();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleDeleteCancelledLeaves = async (id) => {
    try {
      const result = await deleteLeave(id);
      if (result.success) {
        toast.success(`Leave Deleted `);
        fetchData();
      } else {
        toast.error(result.message || "delete failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  }

  const getLeaveStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "APPROVED":
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case "PENDING":
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <UserCog className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">HR Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Leaves • Attendance • Payroll
              </p>
            </div>
          </div>
          <div>

            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          {["LEAVES", "ATTENDANCE", "PAYROLL"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%] dark:text-white">
          {activeTab === "LEAVES" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Employee</th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Period</th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Type / Reason</th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  data.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="font-medium dark:text-white">{leave.employeeId?.name || "—"}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {leave.employeeId?.email || "—"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium dark:text-white">
                          {new Date(leave.startDate).toLocaleDateString("en-IN")} —{" "}
                          {new Date(leave.endDate).toLocaleDateString("en-IN")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{leave.leaveType || "—"}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                          "{leave.reason || "No reason provided"}"
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={getLeaveStatusBadge(leave.status)}>
                          {leave.status || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {leave.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleLeaveStatus(leave._id, "APPROVED")}
                              className="p-2 text-gray-500 hover:text-green-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleLeaveStatus(leave._id, "REJECTED")}
                              className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                        {leave.status === "CANCELLED" && (
                          <button
                            onClick={() => handleDeleteCancelledLeaves(leave._id)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Delete"
                          >
                            <Trash2Icon size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "ATTENDANCE" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Employee</th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Clock In / Out</th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      Loading attendance logs...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No attendance records
                    </td>
                  </tr>
                ) : (
                  data.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4 font-medium">{log.employeeId?.name || "—"}</td>
                      <td className="p-4">
                        {log?.sessions?.map((s) => (
                          <>
                            <div>
                              In: {s.clockIn ? new Date(s.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </div>
                            <div className="text-gray-500">
                              Out: {s.clockOut ? new Date(s.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </div>
                          </>
                        ))}

                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${log.status === "PRESENT"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                        >
                          {log.status || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                        {new Date(log.date).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          {activeTab === "PAYROLL" && (
            // <PayrollManagement data={data} />
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Employee</th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Pay Cycle</th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Net Payable</th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      Loading payroll records...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  data?.map((pay) => (
                    <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4 font-medium">{pay.employeeId?.name || "—"}</td>
                      <td className="p-4">
                        {(() => {
                          const year = Number(pay?.year);
                          const month = Number(pay?.month);

                          if (!year || !month || month < 1 || month > 12) return "—";

                          const date = new Date(year, month - 1);

                          return (
                            <>
                              {new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)} {year}
                            </>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-center font-medium">
                        ₹{(pay.netPayable || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${pay.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                        >
                          {pay.paymentStatus || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRManagement;