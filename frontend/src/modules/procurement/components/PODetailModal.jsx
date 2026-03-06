import React, { useEffect, useState } from "react";
import { X, Package, Truck, Calendar, FileText, CheckCircle2, Clock, User } from "lucide-react";
import { getPurchaseOrderById } from "../../../utils/admin/procurement.util";
import toast from "react-hot-toast";

const PODetailModal = ({ isOpen, onClose, poId, onUpdateStatus }) => {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && poId) {
            fetchPODetails();
        }
    }, [isOpen, poId]);

    const fetchPODetails = async () => {
        setLoading(true);
        try {
            const result = await getPurchaseOrderById(poId);
            if (result.success) {
                console.log(result.data);
                setPo(result.data);
            } else {
                toast.error("Failed to load PO details");
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
            RECEIVED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
            DELIVERED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
            PENDING: `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`,
            ORDERED: `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`,
            CANCELLED: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
        };
        return statusMap[status] || `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Purchase Order Details
                            </h2>
                            {po && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {po.poNumber || po.orderNumber}
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
                    ) : !po ? (
                        <div className="py-16 text-center text-gray-500">PO not found</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Status:</span>
                                    <span className={getStatusBadge(po.status)}>
                                        {po.status || "PENDING"}
                                    </span>
                                </div>
                            </div>

                            {/* Vendor & Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Vendor
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {po.vendorId?.name || po.vendor?.companyName || "Unknown Vendor"}
                                            </p>
                                            {po.vendorId?.contacts?.[0] && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                    <p>Contact: {po.vendorId.contacts[0].name}</p>
                                                    <p>
                                                        {po.vendorId.contacts[0].phone || po.vendorId.contacts[0].email}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        PO Number
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 font-mono">
                                        {po.poNumber || po.orderNumber || "—"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Order Date
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {new Date(po.createdAt).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Expected Delivery
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {po.expectedDeliveryDate || po.deliveryDate
                                                ? new Date(
                                                    po.expectedDeliveryDate || po.deliveryDate
                                                ).toLocaleDateString("en-IN")
                                                : "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payment Terms
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {po.paymentTerms || "Not specified"}
                                    </p>
                                </div>

                                {po.createdBy && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Created By
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-500" />
                                            <p className="text-gray-900 dark:text-gray-100">
                                                {po.createdBy?.name || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        ₹{(po.grandTotal || po.totalAmount || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <Package size={16} className="inline mr-2" />
                                    Items ({po.items?.length || 0})
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
                                            {po.items?.map((item, index) => (
                                                <tr key={index} className="bg-white dark:bg-gray-900">
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {item.itemName || item.name}
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-900 dark:text-gray-100">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-900 dark:text-gray-100">
                                                        ₹{(item.unitPrice || item.price || 0).toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                                                        ₹{(item.total || (item.quantity * (item.unitPrice || item.price)) || 0).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <td colSpan="3" className="p-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                    Subtotal:
                                                </td>
                                                <td className="p-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                    ₹{(po.subtotal || po.totalAmount || po.grandTotal || 0).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                            {po.tax > 0 && (
                                                <tr>
                                                    <td colSpan="3" className="p-3 text-right text-gray-700 dark:text-gray-300">
                                                        Tax:
                                                    </td>
                                                    <td className="p-3 text-right text-gray-900 dark:text-gray-100">
                                                        ₹{(po.tax || 0).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            )}
                                            {po.discount > 0 && (
                                                <tr>
                                                    <td colSpan="3" className="p-3 text-right text-gray-700 dark:text-gray-300">
                                                        Discount:
                                                    </td>
                                                    <td className="p-3 text-right text-green-600 dark:text-green-400">
                                                        -₹{(po.discount || 0).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                                                <td colSpan="3" className="p-3 text-right font-bold text-gray-900 dark:text-gray-100">
                                                    Grand Total:
                                                </td>
                                                <td className="p-3 text-right font-bold text-lg text-blue-600 dark:text-blue-400">
                                                    ₹{(po.grandTotal || po.totalAmount || 0).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            {po.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <FileText size={16} className="inline mr-2" />
                                        Notes
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                                        {po.notes}
                                    </p>
                                </div>
                            )}

                            {/* Status Timeline */}
                            {po.status === "RECEIVED" && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Order Received
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                This purchase order has been marked as received.
                                            </p>
                                        </div>
                                    </div>
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

                    {po && po.status !== "RECEIVED" && po.status !== "DELIVERED" && (
                        <button
                            onClick={() => {
                                onUpdateStatus(po._id, "RECEIVED");
                                onClose();
                            }}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Mark as Received
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PODetailModal;
