const { Inventory, Stock } = require("../../models/inventory.model");

// Get all inventory items with current stock
const handleGetInventory = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { search, category, status } = req.query;

        const query = { businessId };

        if (status) {
            query.status = status;
        } else {
            // Default to active items for employees unless specified
            query.status = "ACTIVE";
        }

        if (category && category !== 'ALL') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        // Get matching inventory items
        const items = await Inventory.find(query).sort({ name: 1 });

        // Get stock for these items
        const itemIds = items.map(item => item._id);
        const stocks = await Stock.find({
            businessId,
            itemId: { $in: itemIds }
        });

        // Map stock to items
        const inventoryWithStock = items.map(item => {
            const itemStock = stocks.find(s => s.itemId.toString() === item._id.toString());
            return {
                ...item.toObject(),
                currentStock: itemStock ? itemStock.quantity : 0,
                stockId: itemStock ? itemStock._id : null
            };
        });

        res.status(200).json({ success: true, data: inventoryWithStock });
    } catch (error) {
        console.error("Get Employee Inventory Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch inventory" });
    }
};

// Get single item details with stock history (history not implemented yet, just current)
const handleGetInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const item = await Inventory.findOne({ _id: id, businessId });
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const stock = await Stock.findOne({ itemId: id, businessId });

        res.status(200).json({
            success: true,
            data: {
                ...item.toObject(),
                currentStock: stock ? stock.quantity : 0,
                reservedStock: stock ? stock.reservedQuantity : 0,
                lastUpdated: stock ? stock.updatedAt : null
            }
        });
    } catch (error) {
        console.error("Get Inventory Item Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch item details" });
    }
};

// Update Stock (Set absolute value or adjust)
// For Employee, we might want to log who did it.
// For now, simple update as per request.
const handleUpdateStock = async (req, res) => {
    try {
        const { id } = req.params; // Item ID
        const businessId = req.user.businessId._id;
        const { quantity, reason, type } = req.body;
        // type: 'SET' (stock take), 'ADD' (receipt), 'REMOVE' (usage)

        const item = await Inventory.findOne({ _id: id, businessId });
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        let stock = await Stock.findOne({ itemId: id, businessId });

        // If no stock record exists, create one
        if (!stock) {
            stock = new Stock({
                businessId,
                itemId: id,
                quantity: 0
            });
        }

        const oldQuantity = stock.quantity;
        let newQuantity = oldQuantity;

        if (type === 'ADD') {
            newQuantity = oldQuantity + Number(quantity);
        } else if (type === 'REMOVE') {
            newQuantity = oldQuantity - Number(quantity);
        } else { // SET
            newQuantity = Number(quantity);
        }

        if (newQuantity < 0 && !item.allowNegativeStock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock. Negative stock not allowed for this item."
            });
        }

        stock.quantity = newQuantity;
        stock.lastUpdatedAt = new Date();

        await stock.save();

        // ideally we should create a Transaction record here for audit trail
        // specifically linking req.user._id as the performer

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: {
                itemId: id,
                oldQuantity,
                newQuantity,
                quantity: stock.quantity
            }
        });

    } catch (error) {
        console.error("Update Stock Error:", error);
        res.status(500).json({ success: false, message: "Failed to update stock" });
    }
};

// Get categories for filtering
const handleGetCategories = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const categories = await Inventory.distinct("category", { businessId });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

module.exports = {
    handleGetInventory,
    handleGetInventoryItem,
    handleUpdateStock,
    handleGetCategories
};
