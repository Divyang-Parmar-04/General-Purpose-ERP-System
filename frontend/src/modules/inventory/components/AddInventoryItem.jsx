import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  Upload,
  Package,
  DollarSign,
  Percent,
  Boxes,
  AlertTriangle,
  RefreshCw,
  FileText,
  Trash2,
} from "lucide-react";
import { createInventoryItemAPI, updateInventoryItem } from "../../../utils/admin/inventory.util";

const AddInventoryItem = ({ onClose, onSuccess, editingItem }) => {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    itemType: "PRODUCT",
    category: "",
    unitOfMeasure: "",
    valuationMethod: "WEIGHTED_AVG",
    costPrice: "",
    sellingPrice: "",
    currency: "INR",
    taxRate: "",
    taxInclusive: false,
    trackInventory: true,
    allowNegativeStock: false,
    description: "",
    reorderLevel: "",
    status: "ACTIVE",
    images: [], // files for upload
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-fill form when editing
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || "",
        sku: editingItem.sku || "",
        itemType: editingItem.itemType || "PRODUCT",
        category: editingItem.category || "",
        unitOfMeasure: editingItem.unitOfMeasure || "",
        valuationMethod: editingItem.valuationMethod || "WEIGHTED_AVG",
        costPrice: editingItem.pricing?.costPrice || "",
        sellingPrice: editingItem.pricing?.sellingPrice || "",
        currency: editingItem.pricing?.currency || "INR",
        taxRate: editingItem.taxProfile?.taxRate || "",
        taxInclusive: editingItem.taxProfile?.inclusive || false,
        trackInventory: editingItem.trackInventory !== undefined ? editingItem.trackInventory : true,
        allowNegativeStock: editingItem.allowNegativeStock || false,
        description: editingItem.description || "",
        reorderLevel: editingItem.stock?.reorderLevel || "",
        status: editingItem.status || "ACTIVE",
        images: [],
      });

      // Set existing images for preview
      if (editingItem.images && editingItem.images.length > 0) {
        setExistingImages(editingItem.images);
      }
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + form.images.length + existingImages.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim() || !form.unitOfMeasure.trim()) {
      toast.error("Item Name and Unit of Measure are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("sku", form.sku.trim());
    formData.append("itemType", form.itemType);
    formData.append("category", form.category.trim());
    formData.append("unitOfMeasure", form.unitOfMeasure.trim());
    formData.append("valuationMethod", form.valuationMethod);

    formData.append("costPrice", form.costPrice || 0);
    formData.append("sellingPrice", form.sellingPrice || 0);
    formData.append("currency", form.currency || "INR");

    formData.append("taxRate", form.taxRate || 0);
    formData.append("taxInclusive", form.taxInclusive);

    formData.append("trackInventory", form.trackInventory);
    formData.append("allowNegativeStock", form.allowNegativeStock);
    formData.append("description", form.description.trim());
    formData.append("reorderLevel", form.reorderLevel || 0);
    formData.append("status", form.status);

    // Append new images
    form.images.forEach((file) => {
      formData.append("images", file);
    });

    // If editing, mark deleted images
    if (editingItem && editingItem.images) {
      const deletedImages = editingItem.images
        .filter((img) => !existingImages.find((ei) => ei.publicId === img.publicId))
        .map((img) => img.publicId);

      deletedImages.forEach((publicId) => {
        formData.append("deletedImages", publicId);
      });
    }

    try {
      const res = editingItem
        ? await updateInventoryItem(editingItem._id, formData)
        : await createInventoryItemAPI(formData);

      if (res.success) {
        toast.success(editingItem ? "Item updated successfully" : "Item added successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || `Failed to ${editingItem ? "update" : "add"} item`);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center z-10 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Package className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {editingItem ? "Update product details and information" : "Add product, service, or material to your inventory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={28} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 dark:text-white">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Mouse Pro"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                SKU (optional)
              </label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. WM-PRO-001"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Unit of Measure <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="unitOfMeasure"
                value={form.unitOfMeasure}
                onChange={handleChange}
                placeholder="e.g. PCS, KG, LTR, BOX"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Item Type
              </label>
              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              >
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="FINISHED_GOOD">Finished Good</option>
                <option value="CONSUMABLE">Consumable</option>
                <option value="ASSET">Asset</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category (optional)
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electronics, Stationery, Tools"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Valuation Method
              </label>
              <select
                name="valuationMethod"
                value={form.valuationMethod}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              >
                <option value="WEIGHTED_AVG">Weighted Average</option>
                <option value="FIFO">FIFO</option>
                <option value="LIFO">LIFO</option>
              </select>
            </div>
          </div>

          {/* Pricing & Tax Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-5 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <DollarSign size={18} className="text-green-600" />
              Pricing & Tax
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <DollarSign size={16} className="text-green-600" />
                  Cost Price
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={form.costPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <DollarSign size={16} className="text-green-600" />
                  Selling Price
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <Percent size={16} className="text-purple-600" />
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                  disabled={loading}
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    name="taxInclusive"
                    checked={form.taxInclusive}
                    onChange={handleChange}
                    className="rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  Inclusive of Tax
                </label>
              </div>
            </div>
          </div>

          {/* Inventory & Stock Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Boxes size={16} className="text-cyan-600" />
                  Track Inventory
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="trackInventory"
                    checked={form.trackInventory}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Allow Negative Stock
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowNegativeStock"
                    checked={form.allowNegativeStock}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={form.reorderLevel}
                onChange={handleChange}
                placeholder="Alert when stock ≤ this level"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 transition-colors"
                disabled={loading}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description, features, specifications..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y dark:bg-gray-800 transition-colors"
              disabled={loading}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Images (optional, max 5)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Existing Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {existingImages.map((image, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                      <img
                        src={image.url}
                        alt={`existing-${idx}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
              <Upload className="text-gray-400 mb-3" size={40} />
              <span className="text-center text-sm text-gray-500 dark:text-gray-400 px-6">
                {form.images.length > 0
                  ? `${form.images.length} new image(s) selected`
                  : "Click or drag images here\nSupported: JPG, PNG, max 5MB each"}
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>

            {/* New Images Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <img
                      src={preview}
                      alt={`preview-${idx}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md disabled:opacity-60"
            >
              {loading && <RefreshCw size={18} className="animate-spin" />}
              {loading ? (editingItem ? "Updating..." : "Adding Item...") : (editingItem ? "Update Item" : "Add Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryItem;