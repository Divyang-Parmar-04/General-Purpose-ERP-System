const { PurchaseRequest } = require("../../models/procurement.model");
const { createAndSendNotification } = require('../../utils/notification.util');
const User = require('../../models/user.model');

// Get employee's own purchase requests
const handleGetMyPurchaseRequests = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const userId = req.user._id;
        const { status, priority } = req.query;

        const query = {
            businessId,
            requestedBy: userId // Only show employee's own PRs
        };

        // Apply filters
        if (status && status !== 'ALL') {
            query.status = status;
        }
        if (priority && priority !== 'ALL') {
            query.priority = priority;
        }

        const requests = await PurchaseRequest.find(query)
            .populate('department', 'name')
            .populate('approvedBy', 'name')
            .populate('convertedToPO', 'poNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Get My Purchase Requests Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase requests' });
    }
};

// Get single purchase request by ID (only own PR)
const handleGetMyPurchaseRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;
        const userId = req.user._id;

        const request = await PurchaseRequest.findOne({
            _id: id,
            businessId,
            requestedBy: userId // Ensure employee can only view their own PR
        })
            .populate('department', 'name')
            .populate('approvedBy', 'name')
            .populate('convertedToPO', 'poNumber grandTotal');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error('Get Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchase request' });
    }
};

// Create new purchase request
const handleCreatePurchaseRequest = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        const { title, description, items, priority, requiredBy, justification, notes, department } = req.body;

        // console.log(req.body)

        if (!title || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Title and items are required' });
        }

        const PR = await PurchaseRequest.countDocuments({ businessId: businessId });

        const requestNumber = `PR-${new Date().getFullYear()}-${String(PR + 1).padStart(3, '0')}`;

        const totalEstimatedAmount = items.reduce((sum, item) => {
            item.estimatedTotal = (item.quantity || 0) * (item.estimatedPrice || 0);
            return sum + item.estimatedTotal;
        }, 0);

        const newRequest = await PurchaseRequest.create({
            businessId,
            requestedBy: req.user._id,
            department: department || req.user.departmentId,
            title,
            description,
            items,
            priority: priority || 'MEDIUM',
            requiredBy,
            justification,
            notes,
            requestNumber,
            totalEstimatedAmount
        });

        // Populate for response
        await newRequest.populate('requestedBy', 'name email');

        await newRequest.populate('department', 'name');

        // Notify admins about new purchase request
        const admins = await User.find({
            businessId,
            "role.name": "ADMIN"
        }).select('_id');
        
        res.status(201).json({ success: true, data: newRequest });

    } catch (error) {
        console.error('Create Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create purchase request' });
    }
};

// Update purchase request (Only if status is PENDING or REJECTED)
const handleUpdatePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;
        const userId = req.user._id;
        const { title, description, items, priority, requiredBy, justification, notes } = req.body;

        const request = await PurchaseRequest.findOne({
            _id: id,
            businessId,
            requestedBy: userId // Ensure employee can only update their own PR
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        // Only allow updates if status is PENDING or REJECTED
        if (request.status !== 'PENDING' && request.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update request. Only PENDING or REJECTED requests can be edited.'
            });
        }

        // Update fields
        if (title) request.title = title;
        if (description !== undefined) request.description = description;
        if (items) request.items = items;
        if (priority) request.priority = priority;
        if (requiredBy !== undefined) request.requiredBy = requiredBy;
        if (justification !== undefined) request.justification = justification;
        if (notes !== undefined) request.notes = notes;

        // If updating a rejected request, reset status to PENDING
        if (request.status === 'REJECTED') {
            request.status = 'PENDING';
            request.rejectionReason = undefined;
            request.approvedBy = undefined;
            request.approvedAt = undefined;
        }

        await request.save();
        await request.populate('department', 'name');

        res.status(200).json({ success: true, data: request });
        
    } catch (error) {
        console.error('Update Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update purchase request' });
    }
};

// Delete purchase request (Only if status is PENDING or REJECTED)
const handleDeletePurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;
        const userId = req.user._id;

        const request = await PurchaseRequest.findOne({
            _id: id,
            businessId,
            requestedBy: userId // Ensure employee can only delete their own PR
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        // Only allow deletion if status is PENDING or REJECTED
        if (request.status !== 'PENDING' && request.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete request. Only PENDING or REJECTED requests can be deleted.'
            });
        }

        await PurchaseRequest.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Purchase request deleted successfully' });
    } catch (error) {
        console.error('Delete Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete purchase request' });
    }
};

// Cancel purchase request (Only if PENDING)
const handleCancelPurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const businessId = req.user.businessId._id;
        const userId = req.user._id;

        const request = await PurchaseRequest.findOne({
            _id: id,
            businessId,
            requestedBy: userId
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Purchase request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Only PENDING requests can be cancelled'
            });
        }

        request.status = 'CANCELLED';
        request.notes = (request.notes || '') + `\nCancelled by ${req.user.name}: ${reason || 'No reason provided'}`;

        await request.save();
        await request.populate('department', 'name');

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error('Cancel Purchase Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel purchase request' });
    }
};

module.exports = {
    handleGetMyPurchaseRequests,
    handleGetMyPurchaseRequestById,
    handleCreatePurchaseRequest,
    handleUpdatePurchaseRequest,
    handleDeletePurchaseRequest,
    handleCancelPurchaseRequest
};
