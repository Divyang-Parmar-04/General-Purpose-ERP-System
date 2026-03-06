import React, { useEffect, useState } from "react";
import {
    Package,
    Search,
    Filter,
    RefreshCw,
    ArrowUpDown,
    Box,
    Loader2
} from "lucide-react";
import { getInventory, getCategories } from "../../../utils/employee/inventory.util";
import toast from "react-hot-toast";
import StockUpdateModal from "../components/StockUpdateModal";

const EmployeeInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ACTIVE");

    // Modal
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [categoryFilter, statusFilter]);

    // Local search filter effectively
    useEffect(() => {
        if (!searchQuery) {
            fetchData(); // Reset if empty
        } else {
            const delayDebounceFn = setTimeout(() => {
                fetchData();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const filters = {
                status: statusFilter,
                search: searchQuery
            };
            if (categoryFilter !== "ALL") filters.category = categoryFilter;

            const result = await getInventory(filters);
            if (result.success) {
                setInventory(result.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const result = await getCategories();
            if (result.success) setCategories(result.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateStock = (item) => {
        setSelectedItem(item);
        setUpdateModalOpen(true);
    };

    const handleUpdateSuccess = (updatedData) => {
        // Optimistically update the list
        setInventory(prev => prev.map(item =>
            item._id === updatedData.itemId
                ? { ...item, currentStock: updatedData.quantity }
                : item
        ));
    };

    const getStockColor = (quantity, reorderLevel) => {
        if (quantity <= 0) return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
        if (quantity <= (reorderLevel || 10)) return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600/10 rounded-xl">
                            <Package className="w-8 h-8 text-blue-500 dark:text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Inventory Management
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Check stock levels and update inventory
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors self-start sm:self-center"
                        title="Refresh data"
                    >
                        <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 border w-[90vw] md:w-[100%] border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by item name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Categories</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ACTIVE">Active Items</option>
                                <option value="INACTIVE">Inactive Items</option>
                                <option value="ALL">All Status</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500 flex justify-center gap-2 items-center flex-col">
                            <Loader2 className="animate-spin h-10 w-10"  />
                            Loading inventory...
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No items found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Adjust your filters to see more results
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Item Details</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-center">Unit</th>
                                        <th className="px-6 py-4 text-right">Current Stock</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {inventory.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.images && item.images[0] ? (
                                                        <img
                                                            src={item.images[0].url}
                                                            alt={item.name}
                                                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                            <Package size={18} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.sku || 'No SKU'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                    {item.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                                {item.unitOfMeasure}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockColor(item.currentStock, item.reorderLevel)}`}>
                                                    {item.currentStock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleUpdateStock(item)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        <ArrowUpDown size={14} />
                                                        Adjust Stock
                                                    </button>
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

            <StockUpdateModal
                isOpen={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                item={selectedItem}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default EmployeeInventory;
