const Sales = require("../../models/sales.model");
const { uploadDocumentToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinary.util");

// Create Order/Invoice
const handleCreateInvoice = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const invoice = await Sales.create({
            ...req.body,
            businessId,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, message: "Invoice created successfully", data: invoice });
    } catch (error) {
        console.error("Create Sales Error:", error);
        res.status(500).json({ success: false, message: "Error creating invoice" });
    }
};

// Create Invoice with Attachments
const handleCreateInvoiceWithAttachments = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { orderNumber, customerId, items, subTotal, grandTotal, discount, dueDate, notes, termsAndConditions, currency } = req.body;
        
        // Parse items if it's a string (from form data)
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        
        // Upload attachments to Cloudinary
        const attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadDocumentToCloudinary(file);
                attachments.push({
                    name: file.originalname,
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        }

        const invoice = await Sales.create({
            orderNumber,
            customerId,
            items: parsedItems,
            subTotal,
            grandTotal,
            discount,
            dueDate,
            notes,
            termsAndConditions,
            attachments,
            currency,
            businessId,
            createdBy: req.user._id
        });

        res.status(201).json({ 
            success: true, 
            message: "Invoice created successfully with attachments", 
            data: invoice 
        });
    } catch (error) {
        // Cleanup uploaded files on error
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.path && require('fs').existsSync(file.path)) {
                    try {
                        require('fs').unlinkSync(file.path);
                    } catch (cleanupErr) {
                        console.error("Error cleaning up temp file:", cleanupErr);
                    }
                }
            }
        }
        console.error("Create Invoice with Attachments Error:", error);
        res.status(500).json({ success: false, message: "Error creating invoice with attachments" });
    }
};

// Get All Sales
const handleGetSales = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const sales = await Sales.find({ businessId })
            .populate("customerId", "organizationName contact.name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: sales });
    } catch (error) {
        console.error("Get Sales Error:", error);
        res.status(500).json({ success: false, message: "Error fetching sales records" });
    }
};

// Update Invoice Status
const handleUpdateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const invoice = await Sales.findByIdAndUpdate(id, { status }, { new: true });

        if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

        res.status(200).json({ success: true, message: "Status updated", data: invoice });
    } catch (error) {
        console.error("Update Sales Error:", error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// Update Invoice Data
const handleUpdateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderNumber, customerId, items, subTotal, grandTotal, discount, dueDate, notes, termsAndConditions, currency } = req.body;

        const updateData = {
            orderNumber,
            customerId,
            items,
            subTotal,
            grandTotal,
            discount,
            dueDate,
            notes,
            termsAndConditions,
            currency
        };

        const invoice = await Sales.findByIdAndUpdate(id, updateData, { new: true });

        if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

        res.status(200).json({ success: true, message: "Invoice updated successfully", data: invoice });
    } catch (error) {
        console.error("Update Invoice Error:", error);
        res.status(500).json({ success: false, message: "Error updating invoice" });
    }
};

// Delete Invoice
const handleDeleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Sales.findByIdAndDelete(id);

        if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

        // Delete attachments from Cloudinary if any
        if (invoice.attachments && invoice.attachments.length > 0) {
            const { deleteFromCloudinary } = require("../../utils/cloudinary.util");
            for (const attachment of invoice.attachments) {
                try {
                    await deleteFromCloudinary(attachment.publicId, "raw");
                } catch (err) {
                    console.error("Error deleting attachment from Cloudinary:", err);
                }
            }
        }

        res.status(200).json({ success: true, message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Delete Invoice Error:", error);
        res.status(500).json({ success: false, message: "Error deleting invoice" });
    }
};

module.exports = {
    handleCreateInvoice,
    handleCreateInvoiceWithAttachments,
    handleGetSales,
    handleUpdateInvoiceStatus,
    handleUpdateInvoice,
    handleDeleteInvoice
};
