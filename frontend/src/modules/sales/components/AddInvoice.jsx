import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createInvoiceWithAttachments, updateInvoiceData } from "../../../utils/admin/sales.util";

const AddInvoice = ({ isOpen, onClose, leads, onInvoiceCreated, invoice = null, mode = "create" }) => {

  const [formData, setFormData] = useState({
    orderNumber: "",
    customerId: "",
    currency: "USD",
    dueDate: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, taxCategory: "GST", taxAmount: 0, totalPrice: 0 }],
    discount: { type: "percentage", value: 0 },
    subTotal: 0,
    grandTotal: 0,
    notes: "",
    termsAndConditions: "",
    attachments: []
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize with invoice data when in edit mode
  useEffect(() => {
    if (mode === "edit" && invoice) {
      setFormData({
        orderNumber: invoice.orderNumber || "",
        customerId: invoice.customerId?._id || invoice.customerId || "",
        currency: invoice.currency || "USD",
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : "",
        items: invoice.items || [{ description: "", quantity: 1, unitPrice: 0, taxCategory: "GST", taxAmount: 0, totalPrice: 0 }],
        discount: invoice.discount || { type: "percentage", value: 0 },
        subTotal: invoice.subTotal || 0,
        grandTotal: invoice.grandTotal || 0,
        notes: invoice.notes || "",
        termsAndConditions: invoice.termsAndConditions || "",
        attachments: invoice.attachments || []
      });
    }
  }, [mode, invoice, isOpen]);


  // Calculate line totals
  useEffect(() => {

    const newItems = formData.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = (itemTotal * (item.taxCategory === "GST" ? 0.18 : item.taxCategory === "VAT" ? 0.15 : 0.10)) || 0;
      return {
        ...item,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalPrice: parseFloat((itemTotal + taxAmount).toFixed(2))
      };
    });

    // Calculate subtotal and apply discount
    const subTotal = parseFloat(
      newItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
    );

    let discountAmount = 0;
    if (formData.discount.type === "percentage") {
      discountAmount = (subTotal * formData.discount.value) / 100;
    } else {
      discountAmount = formData.discount.value;
    }

    const totalTax = parseFloat(newItems.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2));
    const grandTotal = parseFloat((subTotal + totalTax - discountAmount).toFixed(2));

    setFormData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      grandTotal
    }));

  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: isNaN(value) ? value : parseFloat(value) };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unitPrice: 0, taxCategory: "GST", taxAmount: 0, totalPrice: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.orderNumber || !formData.customerId) {
      toast.error("Order Number and Customer are required");
      return;
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error("All items must have description, quantity, and unit price");
      return;
    }

    setLoading(true);
    try {
      const invoiceFormData = new FormData();
      invoiceFormData.append("orderNumber", formData.orderNumber);
      invoiceFormData.append("customerId", formData.customerId);
      invoiceFormData.append("currency", formData.currency);
      invoiceFormData.append("dueDate", formData.dueDate);
      invoiceFormData.append("items", JSON.stringify(formData.items));
      invoiceFormData.append("discount", JSON.stringify(formData.discount));
      invoiceFormData.append("subTotal", formData.subTotal);
      invoiceFormData.append("grandTotal", formData.grandTotal);
      invoiceFormData.append("notes", formData.notes);
      invoiceFormData.append("termsAndConditions", formData.termsAndConditions);

      files.forEach(file => {
        invoiceFormData.append("attachments", file);
      });

      let response;
      if (mode === "edit") {
        // For edit, send updated data as JSON (skip files if no new files)
        response = await updateInvoiceData(invoice._id, {
          orderNumber: formData.orderNumber,
          customerId: formData.customerId,
          currency: formData.currency,
          dueDate: formData.dueDate,
          items: formData.items,
          discount: formData.discount,
          subTotal: formData.subTotal,
          grandTotal: formData.grandTotal,
          notes: formData.notes,
          termsAndConditions: formData.termsAndConditions
        });
      } else {
        response = await createInvoiceWithAttachments(invoiceFormData);
      }

      if (response.success) {
        toast.success(mode === "edit" ? "Invoice updated successfully" : "Invoice created successfully");
        onInvoiceCreated();
        onClose();
        // Reset form
        setFormData({
          orderNumber: "",
          customerId: "",
          currency: "USD",
          dueDate: "",
          items: [{ description: "", quantity: 1, unitPrice: 0, taxCategory: "GST", taxAmount: 0, totalPrice: 0 }],
          discount: { type: "percentage", value: 0 },
          subTotal: 0,
          grandTotal: 0,
          notes: "",
          termsAndConditions: "",
          attachments: []
        });
        setFiles([]);
      } else {
        toast.error(response.message || "Failed to save invoice");
      }
    } catch (error) {
      console.error("Invoice operation error:", error);
      toast.error("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 h-screen">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="sticky bg-white dark:bg-gray-900 top-0 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "edit" ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-white">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">1</span>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                  Order Number *
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., ORD-001"
                  className=" w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                  Customer *
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Customer</option>
                  {leads && leads.map(lead => (
                    <option key={lead._id} value={lead._id}>
                      {lead.organizationName || lead.contact?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">2</span>
                Invoice Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Item description"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Tax Category
                      </label>
                      <select
                        value={item.taxCategory}
                        onChange={(e) => handleItemChange(index, "taxCategory", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      >
                        <option value="GST">GST (18%)</option>
                        <option value="VAT">VAT (15%)</option>
                        <option value="PST">PST (10%)</option>
                        <option value="None">No Tax</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Tax:</span>
                      <p className="text-gray-900 dark:text-white font-semibold">{formData.currency} {item.taxAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Line Total:</span>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">{formData.currency} {item.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-end">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Discount Section */}
          <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">3</span>
              Totals & Discount
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white font-semibold">{formData.currency} {formData.subTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Total Tax:</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formData.currency} {formData.items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.discount.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        discount: { ...prev.discount, type: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount.value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        discount: { ...prev.discount, value: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">
                      Discount Amount
                    </label>
                    <div className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white font-semibold">
                      {formData.currency} {(
                        formData.discount.type === "percentage"
                          ? (formData.subTotal * formData.discount.value / 100)
                          : formData.discount.value
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-3 bg-blue-50 dark:bg-blue-500/10 rounded px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700 dark:text-slate-300">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formData.currency} {formData.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">4</span>
              Additional Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes for the customer..."
                rows="3"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Terms & Conditions
              </label>
              <textarea
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                placeholder="Invoice terms and conditions..."
                rows="3"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">5</span>
              Attachments (Optional)
            </h3>

            <div className="bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="text-gray-400 dark:text-slate-400 mb-2" size={32} />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Click to upload or drag files here
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-500">Max 10 files (PDFs, images, documents)</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-slate-400">Selected Files ({files.length}):</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3"
                    >
                      <span className="text-sm text-gray-700 dark:text-slate-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                mode === "edit" ? "Update Invoice" : "Create Invoice"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoice;