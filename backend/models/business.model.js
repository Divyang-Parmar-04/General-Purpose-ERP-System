const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    legalName: String,
    businessType: String,
    industry: String,
    industryMeta: {
      type: Map,
      of: String 
    },

    email: String,
    phone: String,
    website: String,

    address: {
      addressLine: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },

    logo: {
      url: String,
      publicId: String
    },

    modules: {

      core: { type: Boolean, default: true }, // FORCE ON
      userManagement: { type: Boolean, default: true },
      departments: { type: Boolean, default: true },
      
      hr: { type: Boolean, default: false },
      tasks: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
      announcements: { type: Boolean, default: true },

      inventory: { type: Boolean, default: false },
      procurement: { type: Boolean, default: false },
      sales: { type: Boolean, default: false },
      crm: { type: Boolean, default: false },

      finance: { type: Boolean, default: false },
      accounting: { type: Boolean, default: false },
      taxation: { type: Boolean, default: false },

      reports: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      // auditLogs: { type: Boolean, default: true },

      documents: { type: Boolean, default: false },
      // integrations: { type: Boolean, default: false },
    },

    notificationPreferences: {
      email: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    },

  
    securitySettings: {
      otpEnabled: { type: Boolean, default: true },
      otpExpiryMinutes: { type: Number, default: 5 },
      otpMaxAttempts: { type: Number, default: 3 },
      sessionTimeoutMinutes: { type: Number, default: 60 }
    },

 
    currencySettings: {
      code: { type: String, default: "INR" },
      symbol: { type: String, default: "₹" },
      name: { type: String, default: "Indian Rupee" },
      decimalPlaces: { type: Number, default: 2 },
      position: {
        type: String,
        enum: ["BEFORE", "AFTER"],
        default: "BEFORE"
      }
    },

    taxSettings: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ["GST", "VAT", "SALES", "NONE"],
        default: "NONE"
      },
      label: String,
      percentage: { type: Number, default: 0 },
      inclusive: { type: Boolean, default: false }
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
