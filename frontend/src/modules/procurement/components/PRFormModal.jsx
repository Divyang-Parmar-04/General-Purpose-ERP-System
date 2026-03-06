import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, ShoppingCart } from "lucide-react";
import { createPurchaseRequest, updatePurchaseRequest } from "../../../utils/employee/procurement.util";
import toast from "react-hot-toast";

const PRFormModal = ({ isOpen, onClose, pr, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        requiredBy: "",
        justification: "",
        items: [{ name: "", description: "", quantity: 1, unit: "PCS", estimatedPrice: 0 }],
        notes: ""
    });

    useEffect(() => {
        if (pr) {
            setFormData({
                title: pr.title || "",
                description: pr.description || "",
                priority: pr.priority || "MEDIUM",
                requiredBy: pr.requiredBy ? new Date(pr.requiredBy).toISOString().split('T')[0] : "",
                justification: pr.justification || "",
                items: pr.items?.length > 0 ? pr.items : [{ name: "", description: "", quantity: 1, unit: "PCS", estimatedPrice: 0 }],
                notes: pr.notes || ""
            });
        } else {
            // Reset form for new PR
            setFormData({
                title: "",
                description: "",
                priority: "MEDIUM",
                requiredBy: "",
                justification: "",
                items: [{ name: "", description: "", quantity: 1, unit: "PCS", estimatedPrice: 0 }],
                notes: ""
            });
        }
    }, [pr, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: "", description: "", quantity: 1, unit: "PCS", estimatedPrice: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.estimatedPrice || 0)), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            return toast.error("Title is required");
        }
        if (formData.items.some(item => !item.name.trim() || item.quantity <= 0)) {
            return toast.error("Please fill in valid item details");
        }

        setLoading(true);
        try {
            const result = pr
                ? await updatePurchaseRequest(pr._id, formData)
                : await createPurchaseRequest(formData);

            if (result.success) {
                toast.success(pr ? "Purchase Request updated successfully" : "Purchase Request created successfully");
                onSuccess();
                onClose();
            } else {
                toast.error(result.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 dark:text-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {pr ? "Edit Purchase Request" : "New Purchase Request"}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {pr ? "Update details for this request" : "Create a new procurement request"}
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

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* General Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Request Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="e.g., Office Supplies for Q3"
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Brief description of the request..."
                                rows={2}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleChange("priority", e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Required By Date
                            </label>
                            <input
                                type="date"
                                value={formData.requiredBy}
                                onChange={(e) => handleChange("requiredBy", e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Items Requested
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                            >
                                <Plus size={16} />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Item Name *</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                                placeholder="Item name"
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                placeholder="Details, specs..."
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                    min="1"
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                />
                                                <select
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                                    className="w-20 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="PCS">Pcs</option>
                                                    <option value="KG">Kg</option>
                                                    <option value="BOX">Box</option>
                                                    <option value="SET">Set</option>
                                                    <option value="LTR">Ltr</option>
                                                    <option value="MTR">Mtr</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 relative">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Est. Price</label>
                                            <input
                                                type="number"
                                                value={item.estimatedPrice}
                                                onChange={(e) => handleItemChange(index, "estimatedPrice", e.target.value)}
                                                min="0"
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="absolute -right-2 -top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-2">
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Total Estimated Amount:</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Justification
                            </label>
                            <textarea
                                value={formData.justification}
                                onChange={(e) => handleChange("justification", e.target.value)}
                                placeholder="Why is this purchase needed?"
                                rows={2}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                placeholder="Any special instructions or vendor preferences..."
                                rows={2}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        <Save size={16} />
                        {loading ? "Saving..." : pr ? "Update Request" : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PRFormModal;
