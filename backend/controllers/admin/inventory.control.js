const { Inventory, Stock } = require("../../models/inventory.model");
const { uploadImageToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinary.util");


// Create Inventory Item with Images
const handleCreateItem = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const {
            name,
            sku,
            itemType,
            category,
            unitOfMeasure,
            valuationMethod,
            trackInventory,
            allowNegativeStock,
            description,
            status
        } = req.body;

        // Validate required fields
        if (!name || !unitOfMeasure) {
            return res.status(400).json({
                success: false,
                message: "Item Name and Unit of Measure are required"
            });
        }

        // Handle image uploads
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadImageToCloudinary(file);
                    uploadedImages.push({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } catch (err) {
                    console.error("Image upload error:", err);
                    return res.status(400).json({
                        success: false,
                        message: "Error uploading images"
                    });
                }
            }
        }

        // Parse pricing data
        const pricing = {
            costPrice: parseFloat(req.body["pricing[costPrice]"]) || 0,
            sellingPrice: parseFloat(req.body["pricing[sellingPrice]"]) || 0,
            currency: req.body["pricing[currency]"] || "INR"
        };

        // Parse tax profile data
        const taxProfile = {
            taxRate: parseFloat(req.body["taxProfile[taxRate]"]) || 0,
            inclusive: req.body["taxProfile[inclusive]"] === "true" || false
        };

        // Create inventory item
        const item = await Inventory.create({
            businessId,
            name: name.trim(),
            sku: sku?.trim() || null,
            itemType: itemType || "PRODUCT",
            category: category?.trim() || null,
            unitOfMeasure: unitOfMeasure.trim(),
            valuationMethod: valuationMethod || "WEIGHTED_AVG",
            pricing,
            taxProfile,
            trackInventory: trackInventory !== "false",
            allowNegativeStock: allowNegativeStock === "true" || false,
            description: description?.trim() || null,
            images: uploadedImages,
            status: status || "ACTIVE",
            createdBy: req.user._id
        });

        // Initialize stock record
        const reorderLevel = parseFloat(req.body.reorderLevel) || 0;
        await Stock.create({
            businessId,
            itemId: item._id,
            quantity: 0,
            reservedQuantity: 0,
            reorderLevel
        });

        res.status(201).json({
            success: true,
            message: "Inventory item created successfully",
            data: item
        });
    } catch (error) {
        console.error("Create inventory error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating inventory item"
        });
    }
};

// ==================== READ ====================

// Get All Inventory Items
const handleGetInventory = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { search, category, itemType, status } = req.query;

        let filter = { businessId };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } }
            ];
        }

        if (category) filter.category = category;
        if (itemType) filter.itemType = itemType;
        if (status) filter.status = status;

        const inventory = await Inventory.find(filter)
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");

        res.status(200).json({
            success: true,
            total: inventory.length,
            data: inventory
        });
    } catch (error) {
        console.error("Get inventory error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching inventory"
        });
    }
};

// Get Single Inventory Item
const handleGetInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const item = await Inventory.findOne({ _id: id, businessId })
            .populate("createdBy", "name email");

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Get stock details
        const stock = await Stock.findOne({ itemId: id });

        res.status(200).json({
            success: true,
            data: {
                ...item.toObject(),
                stock: stock || null
            }
        });
    } catch (error) {
        console.error("Get item error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching inventory item"
        });
    }
};

// ==================== UPDATE ====================

// Update Inventory Item
const handleUpdateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const item = await Inventory.findOne({ _id: id, businessId });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Handle image uploads
        let newImages = [...item.images];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadImageToCloudinary(file);
                    newImages.push({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } catch (err) {
                    console.error("Image upload error:", err);
                }
            }
        }

        // Handle image deletions
        if (req.body.deletedImages) {
            const toDelete = Array.isArray(req.body.deletedImages)
                ? req.body.deletedImages
                : [req.body.deletedImages];

            for (const publicId of toDelete) {
                await deleteFromCloudinary(publicId);
            }

            newImages = newImages.filter(img => !toDelete.includes(img.publicId));
        }

        // Parse pricing
        const pricing = {
            costPrice: req.body["pricing[costPrice]"]
                ? parseFloat(req.body["pricing[costPrice]"])
                : item.pricing.costPrice,
            sellingPrice: req.body["pricing[sellingPrice]"]
                ? parseFloat(req.body["pricing[sellingPrice]"])
                : item.pricing.sellingPrice,
            currency: req.body["pricing[currency]"] || item.pricing.currency
        };

        // Parse tax profile
        const taxProfile = {
            taxRate: req.body["taxProfile[taxRate]"]
                ? parseFloat(req.body["taxProfile[taxRate]"])
                : item.taxProfile.taxRate,
            inclusive: req.body["taxProfile[inclusive]"] !== undefined
                ? req.body["taxProfile[inclusive]"] === "true"
                : item.taxProfile.inclusive
        };

        // Update item
        const updatedItem = await Inventory.findByIdAndUpdate(
            id,
            {
                name: req.body.name?.trim() || item.name,
                sku: req.body.sku?.trim() || item.sku,
                itemType: req.body.itemType || item.itemType,
                category: req.body.category?.trim() || item.category,
                unitOfMeasure: req.body.unitOfMeasure?.trim() || item.unitOfMeasure,
                valuationMethod: req.body.valuationMethod || item.valuationMethod,
                pricing,
                taxProfile,
                trackInventory: req.body.trackInventory !== undefined
                    ? req.body.trackInventory !== "false"
                    : item.trackInventory,
                allowNegativeStock: req.body.allowNegativeStock === "true" || false,
                description: req.body.description?.trim() || item.description,
                images: newImages,
                status: req.body.status || item.status
            },
            { new: true }
        );

        // Update reorder level if provided
        if (req.body.reorderLevel) {
            await Stock.findOneAndUpdate(
                { itemId: id },
                { reorderLevel: parseFloat(req.body.reorderLevel) },
                { new: true }
            );
        }

        res.status(200).json({
            success: true,
            message: "Inventory item updated successfully",
            data: updatedItem
        });
    } catch (error) {
        console.error("Update inventory error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating inventory item"
        });
    }
};

// Update Stock Level
const handleUpdateStock = async (req, res) => {
    try {
        const { id } = req.params; // itemId
        const businessId = req.user.businessId._id;
        const { quantity, reservedQuantity, batchNumber, expiryDate } = req.body;

        // Verify item exists
        const item = await Inventory.findOne({ _id: id, businessId });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        const stock = await Stock.findOneAndUpdate(
            { itemId: id, businessId },
            {
                quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
                reservedQuantity: reservedQuantity !== undefined ? parseFloat(reservedQuantity) : undefined,
                batchNumber: batchNumber || undefined,
                expiryDate: expiryDate || undefined,
                lastUpdatedAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: stock
        });
    } catch (error) {
        console.error("Update stock error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating stock"
        });
    }
};

// ==================== DELETE ====================

// Delete Inventory Item
const handleDeleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const item = await Inventory.findOne({ _id: id, businessId });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Delete images from Cloudinary
        if (item.images && item.images.length > 0) {
            for (const image of item.images) {
                try {
                    await deleteFromCloudinary(image.publicId);
                } catch (err) {
                    console.error("Error deleting image:", err);
                }
            }
        }

        // Delete inventory item
        await Inventory.findByIdAndDelete(id);

        // Delete associated stock
        await Stock.deleteMany({ itemId: id });

        res.status(200).json({
            success: true,
            message: "Inventory item deleted successfully"
        });
    } catch (error) {
        console.error("Delete inventory error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting inventory item"
        });
    }
};

// ==================== STOCK OPERATIONS ====================

// Get Stock Details
const handleGetStock = async (req, res) => {
    try {
        const { id } = req.params; // itemId
        const businessId = req.user.businessId._id;

        const stock = await Stock.findOne({ itemId: id, businessId })
            .populate("itemId", "name sku pricing");

        if (!stock) {
            return res.status(404).json({
                success: false,
                message: "Stock record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error("Get stock error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching stock"
        });
    }
};

// Get Low Stock Items
const handleGetLowStockItems = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        const lowStockItems = await Stock.aggregate([
            {
                $match: {
                    businessId: businessId,
                    $expr: { $lte: ["$quantity", "$reorderLevel"] }
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "itemId",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            { $unwind: "$itemDetails" },
            {
                $project: {
                    itemId: 1,
                    itemName: "$itemDetails.name",
                    sku: "$itemDetails.sku",
                    quantity: 1,
                    reorderLevel: 1,
                    unitOfMeasure: "$itemDetails.unitOfMeasure"
                }
            }
        ]);

        res.status(200).json({
            success: true,
            total: lowStockItems.length,
            data: lowStockItems
        });
    } catch (error) {
        console.error("Get low stock error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching low stock items"
        });
    }
};

module.exports = {
    handleCreateItem,
    handleGetInventory,
    handleGetInventoryItem,
    handleUpdateItem,
    handleUpdateStock,
    handleDeleteItem,
    handleGetStock,
    handleGetLowStockItems
};
