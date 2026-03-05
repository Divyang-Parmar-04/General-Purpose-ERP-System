const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    leadType: {
      type: String,
      enum: ["B2B", "B2C"],
      default: "B2B"
    },

    organizationName: {
      type: String, // Optional for B2C
      trim: true
    },

    contact: {
      name: { type: String, required: true },
      email: String,
      phone: String,
      designation: String
    },

    source: {
      type: String,
      index: true // Website, Referral, Ads, Walk-in
    },

    pipelineStage: {
      type: String,
      default: "NEW",
      index: true
      // Stages configurable per business
    },

    status: {
      type: String,
      enum: ["OPEN", "WON", "LOST"],
      default: "OPEN",
      index: true
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM"
    },

    deal: {
      value: Number,
      currency: { type: String, default: "INR" },
      expectedCloseDate: Date,
      probability: { type: Number, default: 0 } // %
    },

    activities: [
      {
        type: {
          type: String,
          enum: ["CALL", "EMAIL", "MEETING", "NOTE", "WHATSAPP"]
        },
        summary: String,
        date: { type: Date, default: Date.now },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    tags: [String],

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

module.exports = mongoose.model("Lead", leadSchema);
