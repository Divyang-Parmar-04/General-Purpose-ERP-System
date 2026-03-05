const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    file: {
      url: {
        type: String,
        required: true
      },
      publicId: String, // Cloudinary / S3 key
      type: { type: String }, // pdf, png, jpg, docx
      size: Number // bytes
    },

    documentType: {
      type: String,
      index: true
      // Example: INVOICE, CONTRACT, OFFER_LETTER, ID_PROOF
      // Keep dynamic (configured per business)
    },

    folder: {
      type: String,
      default: "ROOT"
      // Example: HR/Employees, Finance/Invoices, Projects/Designs
    },

    linkedEntity: {
      entityType: {
        type: String, // User, Lead, Employee, Project, Invoice
        index: true
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
      }
    },

    visibility: {
      type: String,
      enum: ["PRIVATE", "TEAM", "BUSINESS"],
      default: "BUSINESS"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "DELETED"],
      default: "ACTIVE",
      index: true
    },

    version: {
      type: Number,
      default: 1
    },

    tags: [String],

    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
