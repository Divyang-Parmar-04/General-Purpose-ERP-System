import React, { useState, useEffect } from "react";
import { X, Truck, Save } from "lucide-react";
import { createVendor, updateVendor } from "../../../utils/admin/procurement.util";
import toast from "react-hot-toast";

const VendorFormModal = ({ isOpen, onClose, vendor, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "",
        contacts: [{ name: "", email: "", phone: "", designation: "", isPrimary: true }],
        address: {
            billing: { street: "", city: "", state: "", country: "", zip: "" },
            shipping: { street: "", city: "", state: "", country: "", zip: "" }
        },
        taxDetails: { taxId: "", taxType: "GST" },
        paymentTerms: "",
        currency: "INR",
        bankAccounts: [],
        status: "ACTIVE",
        notes: ""
    });

    const [sameAsBilling, setSameAsBilling] = useState(false);

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || "",
                code: vendor.code || "",
                type: vendor.type || "",
                contacts: vendor.contacts?.length > 0 ? vendor.contacts : [{ name: "", email: "", phone: "", designation: "", isPrimary: true }],
                address: vendor.address || {
                    billing: { street: "", city: "", state: "", country: "", zip: "" },
                    shipping: { street: "", city: "", state: "", country: "", zip: "" }
                },
                taxDetails: vendor.taxDetails || { taxId: "", taxType: "GST" },
                paymentTerms: vendor.paymentTerms || "",
                currency: vendor.currency || "INR",
                bankAccounts: vendor.bankAccounts || [],
                status: vendor.status || "ACTIVE",
                notes: vendor.notes || ""
            });
        }
    }, [vendor]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [type]: { ...prev.address[type], [field]: value }
            }
        }));

        if (type === "billing" && sameAsBilling) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    shipping: { ...prev.address.billing, [field]: value }
                }
            }));
        }
    };

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...formData.contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        setFormData(prev => ({ ...prev, contacts: updatedContacts }));
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [...prev.contacts, { name: "", email: "", phone: "", designation: "", isPrimary: false }]
        }));
    };

    const removeContact = (index) => {
        if (formData.contacts.length > 1) {
            const updatedContacts = formData.contacts.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
        }
    };

    const handleSameAsBilling = (checked) => {
        setSameAsBilling(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    shipping: { ...prev.address.billing }
                }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Vendor name is required");
            return;
        }

        setLoading(true);
        try {
            const result = vendor
                ? await updateVendor(vendor._id, formData)
                : await createVendor(formData);

            if (result.success) {
                toast.success(vendor ? "Vendor updated successfully" : "Vendor created successfully");
                onSuccess();
                onClose();
            } else {
                toast.error(result.message || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {vendor ? "Edit Vendor" : "Add New Vendor"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                    Vendor Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                    Vendor Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    placeholder="e.g., VEND-001"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                    Vendor Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleChange("type", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Supplier">Supplier</option>
                                    <option value="Contractor">Contractor</option>
                                    <option value="Service Provider">Service Provider</option>
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="Manufacturer">Manufacturer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="BLACKLISTED">Blacklisted</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Contact Information
                            </h3>
                            <button
                                type="button"
                                onClick={addContact}
                                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                + Add Contact
                            </button>
                        </div>
                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                            Contact Name
                                        </label>
                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(index, "name", e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => handleContactChange(index, "email", e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                                            Designation
                                        </label>
                                        <input
                                            type="text"
                                            value={contact.designation}
                                            onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                {formData.contacts.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove Contact
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Address Information
                        </h3>

                        {/* Billing Address */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Billing Address
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={formData.address.billing.street}
                                        onChange={(e) => handleAddressChange("billing", "street", e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.address.billing.city}
                                    onChange={(e) => handleAddressChange("billing", "city", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.address.billing.state}
                                    onChange={(e) => handleAddressChange("billing", "state", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={formData.address.billing.country}
                                    onChange={(e) => handleAddressChange("billing", "country", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    value={formData.address.billing.zip}
                                    onChange={(e) => handleAddressChange("billing", "zip", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Same as Billing Checkbox */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sameAsBilling}
                                    onChange={(e) => handleSameAsBilling(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Shipping address same as billing
                                </span>
                            </label>
                        </div>

                        {/* Shipping Address */}
                        {!sameAsBilling && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Shipping Address
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Street Address"
                                            value={formData.address.shipping.street}
                                            onChange={(e) => handleAddressChange("shipping", "street", e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.address.shipping.city}
                                        onChange={(e) => handleAddressChange("shipping", "city", e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={formData.address.shipping.state}
                                        onChange={(e) => handleAddressChange("shipping", "state", e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        value={formData.address.shipping.country}
                                        onChange={(e) => handleAddressChange("shipping", "country", e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={formData.address.shipping.zip}
                                        onChange={(e) => handleAddressChange("shipping", "zip", e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tax & Payment Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Tax & Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tax ID (GST/VAT)
                                </label>
                                <input
                                    type="text"
                                    value={formData.taxDetails.taxId}
                                    onChange={(e) => handleNestedChange("taxDetails", "taxId", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tax Type
                                </label>
                                <select
                                    value={formData.taxDetails.taxType}
                                    onChange={(e) => handleNestedChange("taxDetails", "taxType", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="GST">GST</option>
                                    <option value="VAT">VAT</option>
                                    <option value="NONE">None</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Terms
                                </label>
                                <input
                                    type="text"
                                    value={formData.paymentTerms}
                                    onChange={(e) => handleChange("paymentTerms", e.target.value)}
                                    placeholder="e.g., Net 30, COD"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => handleChange("currency", e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            rows={3}
                            placeholder="Additional notes about the vendor..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 text-gray-500 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Save size={16} />
                        {loading ? "Saving..." : vendor ? "Update Vendor" : "Create Vendor"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorFormModal;
