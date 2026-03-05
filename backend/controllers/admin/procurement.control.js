const { Vendor, PurchaseOrder, PurchaseRequest } = require("../../models/procurement.model");
const { createAndSendNotification } = require('../../utils/notification.util');

// ================== VENDOR MANAGEMENT =================

const handleGetVendors = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const vendors = await Vendor.find({ businessId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching vendors" });
    }
};

const handleCreateVendor = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const vendor = await Vendor.create({ ...req.body, businessId, createdBy: req.user._id });
        res.status(201).json({ success: true, data: vendor });
    } catch (error) {
        console.error("Create Vendor Error:", error);
        res.status(500).json({ success: false, message: error.message || "Error creating vendor" });
    }
};

const handleUpdateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const vendor = await Vendor.findOneAndUpdate(
            { _id: id, businessId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        console.error("Update Vendor Error:", error);
        res.status(500).json({ success: false, message: error.message || "Error updating vendor" });
    }
};

const handleDeleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const vendor = await Vendor.findOneAndDelete({ _id: id, businessId });

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        res.status(200).json({ success: true, message: "Vendor deleted successfully" });
    } catch (error) {
        console.error("Delete Vendor Error:", error);
        res.status(500).json({ success: false, message: "Error deleting vendor" });
    }
};

// ================== PURCHASE ORDER MANAGEMENT ==================

const handleGetPOs = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const pos = await PurchaseOrder.find({ businessId })
            .populate("vendorId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: pos });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching POs" });
    }
};

const handleCreatePO = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const po = await PurchaseOrder.create({ ...req.body, businessId, createdBy: req.user._id });
        res.status(201).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating purchase order" });
    }
};

const handleUpdatePOStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const po = await PurchaseOrder.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating PO status" });
    }
};

const handleGetPOById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const po = await PurchaseOrder.findOne({ _id: id, businessId })
            .populate("vendorId", "name type contacts address")
            .populate("createdBy", "name email");

        if (!po) {
            return res.status(404).json({ success: false, message: "Purchase order not found" });
        }

        res.status(200).json({ success: true, data: po });
    } catch (error) {
        console.error("Get PO by ID Error:", error);
        res.status(500).json({ success: false, message: "Error fetching purchase order" });
    }
};

// ================== PURCHASE REQUEST MANAGEMENT ==================

// Get all purchase requests (Admin sees all)
const handleGetPurchaseRequests = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { status, priority, fromDate, toDate } = req.query;

        const query = { businessId };

        // Apply filters
        if (status && status !== 'ALL') {
            query.status = status;
        }
        if (priority && priority !== 'ALL') {
            query.priority = priority;
        }
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        const requests = await PurchaseRequest.find(query)
            .populate('requestedBy', 'name email')
            .populate('department', 'name')
            .populate('approvedBy', 'name')
            .populate('convertedToPO', 'orderNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Get Purchase Requests Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase requests' });
    }
};

// Get single purchase request by ID
const handleGetPurchaseRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const request = await PurchaseRequest.findOne({ _id: id, businessId })
            .populate('requestedBy', 'name email')
            .populate('department', 'name')
            .populate('approvedBy', 'name')
            .populate('convertedToPO', 'poNumber grandTotal vendorId');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error('Get Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase request' });
    }
};

// Approve purchase request (Admin only)
const handleApprovePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const request = await PurchaseRequest.findOne({ _id: id, businessId });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request has already been processed' });
        }

        request.status = 'APPROVED';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();

        await request.save();
        await request.populate('requestedBy', 'name email');
        await request.populate('approvedBy', 'name');


        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error('Approve Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve purchase request' });
    }
};

// Reject purchase request (Admin only)
const handleRejectPurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const businessId = req.user.businessId._id;

        const request = await PurchaseRequest.findOne({ _id: id, businessId });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request has already been processed' });
        }

        request.status = 'REJECTED';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        request.rejectionReason = reason || 'No reason provided';

        await request.save();
        await request.populate('requestedBy', 'name email');
        await request.populate('approvedBy', 'name');


        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error('Reject Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject purchase request' });
    }
};

// Convert purchase request to purchase order (Admin only)
const handleConvertToPurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const { vendorId, deliveryDate, paymentTerms, notes, items } = req.body;

        const businessId = req.user.businessId._id;

        if (!vendorId) {
            return res.status(400).json({ success: false, message: 'Vendor is required' });
        }

        const request = await PurchaseRequest.findOne({ _id: id, businessId });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        if (request.status !== 'APPROVED') {
            return res.status(400).json({ success: false, message: 'Only approved requests can be converted to PO' });
        }

        if (request.convertedToPO) {
            return res.status(400).json({ success: false, message: 'Request has already been converted to PO' });
        }

        // Create purchase order from request
        const poItems = items.map(item => ({
            itemName: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.estimatedPrice || 0,
            total: (item.quantity || 0) * (item.estimatedPrice || 0)
        }));

        const subtotal = poItems.reduce((sum, item) => sum + (item.total || 0), 0);

        const PO = await PurchaseOrder.countDocuments({ businessId: businessId });

        const poNumber = `PO-${new Date().getFullYear()}-${String(PO + 1).padStart(3, '0')}`;


        const purchaseOrder = await PurchaseOrder.create({
            businessId,
            vendorId: vendorId,  // Use vendorId, not vendor
            items: poItems,
            poNumber: poNumber,
            subtotal: subtotal,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: subtotal,
            expectedDeliveryDate: deliveryDate,
            notes: notes || `Created from PR: ${request.requestNumber}`,
            createdBy: req.user._id,
            status: 'PENDING'
        });

        // Update purchase request
        request.status = 'CONVERTED_TO_PO';
        request.convertedToPO = purchaseOrder._id;
        await request.save();

        await purchaseOrder.populate('vendorId', 'name contacts');
        await request.populate('requestedBy', 'name email');


        res.status(201).json({
            success: true,
            data: { purchaseOrder , purchaseRequest: request }
        });

    } catch (error) {
        console.error('Convert to PO Error:', error);
        res.status(500).json({ success: false, message: 'Failed to convert to purchase order' });
    }
};


module.exports = {
    handleGetVendors,
    handleCreateVendor,
    handleUpdateVendor,
    handleDeleteVendor,
    handleGetPOs,
    handleGetPOById,
    handleCreatePO,
    handleUpdatePOStatus,
    handleGetPurchaseRequests,
    handleGetPurchaseRequestById,
    handleApprovePurchaseRequest,
    handleRejectPurchaseRequest,
    handleConvertToPurchaseOrder
};
