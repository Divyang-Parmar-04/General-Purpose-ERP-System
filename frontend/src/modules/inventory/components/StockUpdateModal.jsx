import React, { useState } from "react";
import { X, Save, ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { updateStock } from "../../../utils/employee/inventory.util";
import toast from "react-hot-toast";

const StockUpdateModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("ADD"); // ADD, REMOVE, SET
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!quantity || Number(quantity) <= 0) {
            return toast.error("Please enter a valid quantity");
        }

        if (type === "REMOVE" && item.currentStock < Number(quantity) && !item.allowNegativeStock) {
            return toast.error("Insufficient stock to remove");
        }

        setLoading(true);
        try {
            const result = await updateStock(item._id, {
                quantity,
                type,
                reason
            });

            if (result.success) {
                toast.success(result.message);
                onSuccess(result.data);
                onClose();
                // Reset form
                setQuantity("");
                setReason("");
                setType("ADD");
            } else {
                toast.error(result.message || "Failed to update stock");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Update Stock
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.name} ({item.sku || 'No SKU'})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Current Stock Display */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Current Stock</span>
                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {item.currentStock} <span className="text-base font-normal">{item.unitOfMeasure}</span>
                        </span>
                    </div>

                    {/* Operation Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType("ADD")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${type === "ADD"
                                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 ring-2 ring-green-500/20"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            <ArrowDown size={18} />
                            <div className="text-left">
                                <div className="text-sm font-medium">Add Stock</div>
                                <div className="text-[10px] opacity-70">Incoming/Return</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType("REMOVE")}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${type === "REMOVE"
                                    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 ring-2 ring-red-500/20"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            <ArrowUp size={18} />
                            <div className="text-left">
                                <div className="text-sm font-medium">Remove Stock</div>
                                <div className="text-[10px] opacity-70">Usage/Damage</div>
                            </div>
                        </button>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quantity ({item.unitOfMeasure})
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0.00"
                            min="0.001"
                            step="any"
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                            required
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason / Notes (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Received new shipment, Damaged in transit..."
                            rows={2}
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Save Update
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockUpdateModal;
