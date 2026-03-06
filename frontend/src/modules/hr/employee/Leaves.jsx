import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Calendar, XCircle, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  applyForLeaveAPI,
  cancelLeaveAPI,
  getAllLeavesAPI,
} from "../../../utils/employee/hr.util";

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await getAllLeavesAPI();
      setLeaves(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      return toast.error("Please fill all required fields");
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      return toast.error("End date must be after start date");
    }

    // console.log(form)

    setSubmitting(true);
    try {
      await applyForLeaveAPI({
        ...form,
        duration: { value: 1, unit: "DAY" }, // adjust logic if needed
      });

      toast.success("Leave request submitted successfully");
      setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
      fetchMyLeaves();
    } catch (err) {
      toast.error(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;

    setSubmitting(true);
    try {
      await cancelLeaveAPI(id);
      toast.success("Leave request cancelled");
      fetchMyLeaves();
    } catch (err) {
      console.log(err)
      toast.error(err.message || "Failed to cancel leave");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "APPROVED":
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case "PENDING":
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case "CANCELLED":
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle size={14} className="mr-1" />;
      case "PENDING":
        return <Clock size={14} className="mr-1" />;
      case "REJECTED":
        return <AlertCircle size={14} className="mr-1" />;
      case "CANCELLED":
        return <XCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Leave Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Apply for leave and track your requests
              </p>
            </div>
          </div>
          <div>

            <button
              onClick={fetchMyLeaves}
              disabled={loading || submitting}
              className="p-2.5 border  border-gray-300 dark:border-gray-700 dark:text-gray-300  rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading || submitting ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Apply Leave Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 w-[90vw] md:w-[100%]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Calendar size={20} className="text-blue-600" />
            Apply for Leave
          </h2>

          <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-2 dark:text-gray-300  lg:grid-cols-4 gap-5">
            {/* Leave Type  */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:text-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={submitting}
              >
                <option value="">Select Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>

              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={submitting}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={submitting}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <RefreshCw size={18} className="animate-spin" />}
                {submitting ? "Submitting..." : "Apply Leave"}
              </button>
            </div>

            {/* Reason - full width */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Brief reason for leave (optional)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none dark:bg-gray-800 transition-colors"
                disabled={submitting}
              />
            </div>
          </form>
        </div>

        {/* My Leave Requests */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 w-[90vw] md:w-[100%]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Clock size={20} className="text-amber-600" />
            My Leave Requests
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={28} className="animate-spin text-blue-600 mr-3" />
              <p className="text-gray-600 dark:text-gray-400">Loading leave records...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-40" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {leave.leaveType || "Unknown Type"}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {new Date(leave.startDate).toLocaleDateString()} →{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadge(leave.status)}>
                          {getStatusIcon(leave.status)}
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {leave.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Cancel
                          </button>
                        )}
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

export default LeavePage;