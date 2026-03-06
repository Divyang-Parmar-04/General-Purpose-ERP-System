import React, { useState } from "react";
import { X, Package } from "lucide-react";

const ConvertToPOModal = ({ isOpen, onClose, purchaseRequest, vendors, onConvert }) => {
    const [formData, setFormData] = useState({
        vendorId: "",
        deliveryDate: "",
        paymentTerms: "",
        notes: "",
        items: purchaseRequest?.items || [],
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.vendorId) {
            alert("Please select a vendor");
            return;
        }

        setLoading(true);
        console.log(formData);
        try {
            await onConvert(formData);
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'estimatedUnitPrice') {
            updatedItems[index].estimatedTotal =
                (updatedItems[index].quantity || 0) * (updatedItems[index].estimatedUnitPrice || 0);
        }

        setFormData({ ...formData, items: updatedItems });
    };

    const totalAmount = formData.items.reduce(
        (sum, item) => sum + (item.estimatedTotal || 0),
        0
    );

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
                                Convert to Purchase Order
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                PR: {purchaseRequest?.requestNumber} - {purchaseRequest?.title}
                            </p>
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Vendor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Vendor *
                        </label>
                        <select
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">-- Select Vendor --</option>
                            {vendors.map((vendor) => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.name} - {vendor.type || "General"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Delivery Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Expected Delivery Date
                            </label>
                            <input
                                type="date"
                                value={formData.deliveryDate}
                                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Payment Terms
                            </label>
                            <input
                                type="text"
                                value={formData.paymentTerms}
                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                placeholder="e.g., Net 30, COD"
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Items (Review & Update Prices)
                        </h3>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Item
                                        </th>
                                        <th className="p-3 text-center font-medium text-gray-700 dark:text-gray-300">
                                            Qty
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
                                    {formData.items.map((item, index) => (
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
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
                                                    }
                                                    className="w-20 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-gray-100"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    value={item.estimatedUnitPrice}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "estimatedUnitPrice", parseFloat(e.target.value) || 0)
                                                    }
                                                    className="w-28 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-gray-100"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                                                ₹{(item.estimatedTotal || 0).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                                            Total Amount:
                                        </td>
                                        <td className="p-3 text-right font-bold text-lg text-gray-900 dark:text-gray-100">
                                            ₹{totalAmount.toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any special instructions or notes..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                        {loading ? "Creating PO..." : "Create Purchase Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConvertToPOModal;
