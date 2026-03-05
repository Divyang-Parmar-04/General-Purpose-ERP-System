const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
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

        code: {
            type: String,
            trim: true,
            index: true
            // Example: VEND-001
        },

        type: {
            type: String,
            index: true
            // Supplier, Contractor, Service Provider, Freelancer
        },

        contacts: [
            {
                name: String,
                email: String,
                phone: String,
                designation: String,
                isPrimary: { type: Boolean, default: false }
            }
        ],

        address: {
            billing: {
                street: String,
                city: String,
                state: String,
                country: String,
                zip: String
            },
            shipping: {
                street: String,
                city: String,
                state: String,
                country: String,
                zip: String
            }
        },

        taxDetails: {
            taxId: String, // GST / VAT
            taxType: String // GST, VAT, NONE
        },

        paymentTerms: {
            type: String
            // Net 15, Net 30, Advance, COD
        },

        currency: {
            type: String,
            default: "INR"
        },

        bankAccounts: [
            {
                accountName: String,
                accountNumber: String,
                bankName: String,
                ifscCode: String,
                swiftCode: String,
                isPrimary: Boolean
            }
        ],

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "BLACKLISTED"],
            default: "ACTIVE",
            index: true
        },

        notes: String,

        customFields: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    poNumber: {
      type: String,
      required: true,
      index: true
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },

    items: [
      {
        itemType: {
          type: String,
          enum: ["INVENTORY", "SERVICE"],
          default: "INVENTORY"
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId
        },
        description: String,
        quantity: Number,
        unitPrice: Number,
        taxRate: Number,
        discount: Number,
        total: Number
      }
    ],

    subtotal: Number,
    taxTotal: Number,
    discountTotal: Number,
    grandTotal: Number,

    currency: {
      type: String,
      default: "INR"
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "ORDERED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CANCELLED"
      ],
      default: "DRAFT",
      index: true
    },

    approvalFlow: [
      {
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["APPROVED", "REJECTED"] },
        remarks: String,
        date: Date
      }
    ],

    expectedDeliveryDate: Date,
    receivedDate: Date,

    linkedTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },

    notes: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const purchaseRequestSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    requestNumber: {
        type: String,
        // required: true,
        unique: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        estimatedPrice: {
            type: Number,
            default: 0
        },
        estimatedTotal: {
            type: Number,
            default: 0
        },
        specifications: String
    }],
    totalEstimatedAmount: {
        type: Number,
        default: 0
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    requiredBy: {
        type: Date
    },
    justification: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CONVERTED_TO_PO', 'CANCELLED'],
        default: 'PENDING'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    convertedToPO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});



// PO number unique per business
purchaseOrderSchema.index(
  { businessId: 1, poNumber: 1 },
  { unique: true }
);
// Unique vendor name per business
vendorSchema.index(
    { businessId: 1, name: 1 },
    { unique: true }
);


const Vendor = mongoose.model("Vendor", vendorSchema);
const PurchaseRequest = mongoose.model("PurchaseRequest", purchaseRequestSchema);
const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = { Vendor, PurchaseRequest, PurchaseOrder };
