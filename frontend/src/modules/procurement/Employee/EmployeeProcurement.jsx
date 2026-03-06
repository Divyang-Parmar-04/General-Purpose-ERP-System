import React, { useEffect, useState } from "react";
import {
    PackageSearch,
    Plus,
    RefreshCw,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    FileText,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Ban
} from "lucide-react";
import {
    getMyPurchaseRequests,
    deletePurchaseRequest,
    cancelPurchaseRequest
} from "../../../utils/employee/procurement.util";
import toast from "react-hot-toast";
import PRFormModal from "../components/PRFormModal";
import PRDetailModal from "../components/PRDetailModal";

const EmployeeProcurement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    // Modals state
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState(null);
    const [selectedPRId, setSelectedPRId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, priorityFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (statusFilter !== "ALL") filters.status = statusFilter;
            if (priorityFilter !== "ALL") filters.priority = priorityFilter;

            const result = await getMyPurchaseRequests(filters);
            if (result.success) {
                setRequests(result.data);
            } else {
                toast.error("Failed to load purchase requests");
            }
        } catch (error) {
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPR(null);
        setFormModalOpen(true);
    };

    const handleEdit = (pr) => {
        setSelectedPR(pr);
        setFormModalOpen(true);
    };

    const handleView = (prId) => {
        setSelectedPRId(prId);
        setDetailModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this purchase request?")) return;

        try {
            const result = await deletePurchaseRequest(id);
            if (result.success) {
                toast.success("Request deleted successfully");
                fetchRequests();
            } else {
                toast.error(result.message || "Failed to delete request");
            }
        } catch (error) {
            toast.error("Error deleting request");
        }
    };

    const handleCancel = async (id) => {
        const reason = window.prompt("Please provide a reason for cancellation:");
        if (!reason) return;

        try {
            const result = await cancelPurchaseRequest(id, reason);
            if (result.success) {
                toast.success("Request cancelled successfully");
                fetchRequests();
            } else {
                toast.error(result.message || "Failed to cancel request");
            }
        } catch (error) {
            toast.error("Error cancelling request");
        }
    };

    const getStatusBadge = (status) => {
        const base = "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full";
        const statusMap = {
            APPROVED: `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`,
            PENDING: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`,
            REJECTED: `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`,
            CONVERTED_TO_PO: `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`,
            CANCELLED: `${base} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400`,
        };

        const iconMap = {
            APPROVED: <CheckCircle2 size={12} />,
            PENDING: <Clock size={12} />,
            REJECTED: <XCircle size={12} />,
            CONVERTED_TO_PO: <FileText size={12} />,
            CANCELLED: <Ban size={12} />,
        };

        return (
            <span className={statusMap[status] || statusMap.PENDING}>
                {iconMap[status]}
                {status?.replace(/_/g, " ")}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const base = "inline-block px-2 py-0.5 text-xs font-medium rounded border";
        const priorityMap = {
            URGENT: `${base} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`,
            HIGH: `${base} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800`,
            MEDIUM: `${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`,
            LOW: `${base} bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700`,
        };
        return <span className={priorityMap[priority] || priorityMap.MEDIUM}>{priority}</span>;
    };

    // Filter requests based on search query locally
    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-xl">
                            <PackageSearch className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                My Purchase Requests
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage and track your procurement requests
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm flex items-center gap-2"
                        >
                            <Plus size={18} />
                            New Request
                        </button>
                        <button
                            onClick={fetchRequests}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title or request ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="CONVERTED_TO_PO">Converted to PO</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="relative">
                            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="URGENT">Urgent</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col justify-center items-center text-gray-500">
                            <div className="loader mx-auto mb-4"></div>
                            Loading requests...
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PackageSearch className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters" : "Create a new purchase request to get started"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Request Details</th>
                                        <th className="px-6 py-4 text-center">Priority</th>
                                        <th className="px-6 py-4 text-center">Items</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Estimated Cost</th>
                                        <th className="px-6 py-4 text-center">Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {filteredRequests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                        {req.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        #{req.requestNumber}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getPriorityBadge(req.priority)}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                                                {req.items?.length || 0} items
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                                                ₹{req.totalEstimatedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleView(req._id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    {(req.status === 'PENDING' || req.status === 'REJECTED') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(req)}
                                                                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                                title="Edit Request"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(req._id)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Delete Request"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {req.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancel(req._id)}
                                                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                            title="Cancel Request"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* PR Form Modal */}
            <PRFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                pr={selectedPR}
                onSuccess={fetchRequests}
            />

            {/* PR Detail Modal */}
            <PRDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                prId={selectedPRId}
                userRole="EMPLOYEE" // Pass user role to adjust modal view if needed
            />
        </div>
    );
};

export default EmployeeProcurement;
