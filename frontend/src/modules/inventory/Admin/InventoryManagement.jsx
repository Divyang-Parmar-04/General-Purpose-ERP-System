import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  Warehouse,
  Boxes,
  View,
  Edit,
  Trash2,
} from "lucide-react";
import { getInventory, deleteInventoryItem } from "../../../utils/admin/inventory.util";
import toast from "react-hot-toast";

import AddInventoryItem from "../components/AddInventoryItem";
import StockManagement from "../components/StockManagement";
const InventoryManagement = () => {

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getInventory();
      if (result.success) {
        setInventory(result.data || []);
      } else {
        toast.error(result.message || "Failed to load inventory");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = inventory.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (item) =>
    item.stockLevel?.current <= (item.stockLevel?.minThreshold || 0);

  const onFormClick = () => {
    setIsOpen(!isOpen);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const handleDelete = async (id, itemName) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteInventoryItem(id);
      if (result.success) {
        toast.success("Inventory item deleted successfully");
        fetchData();
      } else {
        toast.error(result.message || "Failed to delete item");
      }
    } catch (err) {
      toast.error(err.message || "Error deleting item");
    }
  };

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {isOpen && (
          <AddInventoryItem
            editingItem={editingItem}
            onClose={onFormClick}
            onSuccess={() => {
              fetchData(); // refresh list after adding
              onFormClick(); // close modal
            }}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Boxes className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Inventory
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Stock • Products • Warehouse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border dark:text-white border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              onClick={onFormClick}
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2  dark:text-white" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 dark:text-white py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%] dark:text-white">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Product / SKU</th>
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Pricing</th>
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Stock</th>
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Status</th>
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Category</th>
                <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading inventory...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No items found</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-1">SKU: {item.sku || "—"}</div>
                    </td>
                    <td className="p-4">
                      <div>Sale: ₹{(item.pricing?.sellingPrice || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Cost: ₹{(item.pricing?.costPrice || 0).toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-medium">
                        {item.stockLevel?.current || 0} {item.unitOfMeasure || "pcs"}
                      </div>
                      {isLowStock(item) && (
                        <div className="text-xs text-red-600 mt-1">Low Stock</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${item.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                        {item.status || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {item.category || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
export default InventoryManagement;