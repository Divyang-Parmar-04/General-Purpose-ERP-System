import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Package,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { getInventory, getStock, updateStock, getLowStockItems } from "../../../utils/admin/inventory.util";

const StockManagement = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, low-stock
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: "",
    reservedQuantity: "",
    batchNumber: "",
    expiryDate: "",
  });

  // Fetch all inventory items with stock
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getInventory();
      if (res.success) {
        setItems(res.data || []);
      } else {
        toast.error("Failed to fetch inventory");
      }
    } catch (err) {
      toast.error(err.message || "Error fetching inventory");
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock items
  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await getLowStockItems();
      if (res.success) {
        setLowStockItems(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching low stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchItems();
    } else {
      fetchLowStock();
    }
  }, [activeTab]);

  // Handle edit click
  const handleEditClick = async (itemId) => {
    try {
      const res = await getStock(itemId);
      if (res.success && res.data) {
        setEditingId(itemId);
        setEditForm({
          quantity: res.data.quantity || "",
          reservedQuantity: res.data.reservedQuantity || "",
          batchNumber: res.data.batchNumber || "",
          expiryDate: res.data.expiryDate ? res.data.expiryDate.split("T")[0] : "",
        });
      }
    } catch (err) {
      toast.error("Failed to fetch stock details");
    }
  };

  // Handle update stock
  const handleUpdateStock = async (itemId) => {
    if (!editForm.quantity && editForm.quantity !== 0) {
      toast.error("Quantity is required");
      return;
    }

    try {
      const stockData = {
        quantity: parseFloat(editForm.quantity),
        reservedQuantity: parseFloat(editForm.reservedQuantity) || 0,
        batchNumber: editForm.batchNumber || null,
        expiryDate: editForm.expiryDate || null,
      };

      const res = await updateStock(itemId, stockData);
      if (res.success) {
        toast.success("Stock updated successfully");
        setEditingId(null);
        if (activeTab === "all") {
          fetchItems();
        } else {
          fetchLowStock();
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to update stock");
    }
  };

  // Filter items based on search
  const displayItems = activeTab === "all" ? items : lowStockItems;
  const filteredItems = displayItems.filter((item) => {
    const name = item.itemName || item.name || "";
    const sku = item.sku || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stock Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage inventory stock levels and quantities
          </p>
        </div>
        <button
          onClick={() => fetchItems()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} />
            All Stock ({items.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("low-stock")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "low-stock"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Low Stock ({lowStockItems.length})
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? "No items match your search" : "No stock items found"}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Item Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  SKU
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Quantity
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Reserved
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Reorder Level
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Unit
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredItems.map((item) => (
                <tr
                  key={item._id || item.itemId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {item.itemName || item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.sku || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === (item._id || item.itemId) ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) =>
                          setEditForm({ ...editForm, quantity: e.target.value })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.quantity || 0}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === (item._id || item.itemId) ? (
                      <input
                        type="number"
                        value={editForm.reservedQuantity}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            reservedQuantity: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.reservedQuantity || 0}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {item.reorderLevel || "-"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {item.unitOfMeasure || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === (item._id || item.itemId) ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() =>
                            handleUpdateStock(item._id || item.itemId)
                          }
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(item._id || item.itemId)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal Expansion */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Update Stock Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={editForm.batchNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batchNumber: e.target.value })
                  }
                  placeholder="e.g. BATCH-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStock(editingId)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
