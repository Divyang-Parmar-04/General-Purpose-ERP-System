import React, { useEffect, useState } from "react";
import { X, FileText, User, Calendar, Package, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getPurchaseRequestById } from "../../../utils/admin/procurement.util";
import toast from "react-hot-toast";

const PRDetailModal = ({ isOpen, onClose, prId, onApprove, onReject, onConvert }) => {
    const [pr, setPr] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && prId) {
            fetchPRDetails();
        }
    }, [isOpen, prId]);

    const fetchPRDetails = async () => {
        setLoading(true);
        try {
            const result = await getPurchaseRequestById(prId);
            // console.log(result);
            if (result.success) {
                setPr(result.data);
            } else {
                toast.error("Failed to load PR details");
            }
        } catch (error) {
            toast.error("Error loading details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusBadge = (status) => {
        const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
        const statusMap = {
            APPROVED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
            PENDING: `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`,
            CONVERTED_TO_PO: `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300`,
            CANCELLED: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
            REJECTED: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
        };
        return statusMap[status] || `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    };

    const getPriorityBadge = (priority) => {
        const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
        const priorityMap = {
            URGENT: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
            HIGH: `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300`,
            MEDIUM: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300`,
            LOW: `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`,
        };
        return priorityMap[priority] || priorityMap.MEDIUM;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Purchase Request Details
                            </h2>
                            {pr && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {pr.requestNumber}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="py-16 text-center text-gray-500">Loading...</div>
                    ) : !pr ? (
                        <div className="py-16 text-center text-gray-500">PR not found</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status & Priority */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Status:</span>
                                    <span className={getStatusBadge(pr.status)}>
                                        {pr.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Priority:</span>
                                    <span className={getPriorityBadge(pr.priority)}>{pr.priority}</span>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Title
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">{pr.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Requested By
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-500" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {pr.requestedBy?.name || "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Department
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {pr.department?.name || "Not specified"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Required By
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {pr.requiredBy
                                                ? new Date(pr.requiredBy).toLocaleDateString("en-IN")
                                                : "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Created On
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Estimated Amount
                                    </label>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        ₹{(pr.totalEstimatedAmount || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {pr.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        {pr.description}
                                    </p>
                                </div>
                            )}

                            {/* Justification */}
                            {pr.justification && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Justification
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        {pr.justification}
                                    </p>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <Package size={16} className="inline mr-2" />
                                    Items ({pr.items?.length || 0})
                                </label>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                                    Item Name
                                                </th>
                                                <th className="p-3 text-center font-medium text-gray-700 dark:text-gray-300">
                                                    Quantity
                                                </th>
                                                <th className="p-3 text-center font-medium text-gray-700 dark:text-gray-300">
                                                    Unit Price
                                                </th>
                                                <th className="p-3 text-right font-medium text-gray-700 dark:text-gray-300">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {pr.items?.map((item, index) => (
                                                <tr key={index} className="bg-white dark:bg-gray-900">
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {item.itemName}
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                        {item.specifications && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Specs: {item.specifications}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-900 dark:text-gray-100">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-900 dark:text-gray-100">
                                                        ₹{(item.estimatedUnitPrice || 0).toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                                                        ₹{(item.estimatedTotal || 0).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Approval Info */}
                            {pr.approvedBy && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {pr.status === "APPROVED" ? "Approved" : "Processed"} by {pr.approvedBy?.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {pr.approvedAt
                                                    ? new Date(pr.approvedAt).toLocaleString("en-IN")
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {pr.status === "REJECTED" && pr.rejectionReason && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Rejection Reason
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {pr.rejectionReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Converted to PO */}
                            {pr.convertedToPO && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Converted to Purchase Order
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                PO Number: {typeof pr.convertedToPO === 'object' ? (pr.convertedToPO?.orderNumber || pr.convertedToPO?.poNumber || 'N/A') : pr.convertedToPO}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {pr.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                                        {pr.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with Actions */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>

                    {pr && (
                        <div className="flex gap-3">
                            {pr.status === "PENDING" && (
                                <>
                                    <button
                                        onClick={() => {
                                            onReject(pr._id);
                                            onClose();
                                        }}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            onApprove(pr._id);
                                            onClose();
                                        }}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve
                                    </button>
                                </>
                            )}

                            {pr.status === "APPROVED" && !pr.convertedToPO && (
                                <button
                                    onClick={() => {
                                        onConvert(pr);
                                        onClose();
                                    }}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Convert to PO
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PRDetailModal;
