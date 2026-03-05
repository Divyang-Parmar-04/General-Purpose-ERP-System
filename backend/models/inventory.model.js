const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    sku: {
      type: String,
      index: true
    },

    itemType: {
      type: String,
      enum: [
        "PRODUCT",
        "SERVICE",
        "RAW_MATERIAL",
        "FINISHED_GOOD",
        "CONSUMABLE",
        "ASSET"
      ],
      default: "PRODUCT"
    },

    category: {
      type: String,
      index: true
    },

    unitOfMeasure: {
      type: String, // PCS, KG, LTR, HOUR, DAY
      required: true
    },

    valuationMethod: {
      type: String,
      enum: ["FIFO", "LIFO", "WEIGHTED_AVG"],
      default: "WEIGHTED_AVG"
    },

    pricing: {
      costPrice: { type: Number, default: 0 },
      sellingPrice: { type: Number, default: 0 },
      currency: { type: String, default: "INR" }
    },

    taxProfile: {
      taxCode: String,
      taxRate: { type: Number, default: 0 },
      inclusive: { type: Boolean, default: false }
    },

    trackInventory: {
      type: Boolean,
      default: true // false for services
    },

    allowNegativeStock: {
      type: Boolean,
      default: false
    },

    description: String,

    images: [
      {
        url: String,
        publicId: String
      }
    ],

    metadata: {
      type: Map,
      of: String // industry-specific extensions
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DISCONTINUED"],
      default: "ACTIVE"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const stockSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      index: true
    },

    quantity: {
      type: Number,
      default: 0
    },

    reservedQuantity: {
      type: Number,
      default: 0
    },

    reorderLevel: {
      type: Number,
      default: 0
    },

    batchNumber: String, // optional
    expiryDate: Date, // optional (pharma, food)

    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

const Inventory = mongoose.model("Inventory", inventorySchema);



module.exports = {Stock,Inventory}
