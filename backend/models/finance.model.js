const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
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
      type: String, // e.g. 1001, SALES-001
      index: true
    },

    type: {
      type: String,
      enum: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"],
      required: true
    },

    subType: {
      type: String, 
      // Cash, Bank, Inventory, Accounts Receivable, Salary Expense etc.
      index: true
    },

    openingBalance: {
      amount: { type: Number, default: 0 },
      type: {
        type: String,
        enum: ["DEBIT", "CREDIT"],
        default: "DEBIT"
      }
    },

    currency: {
      type: String,
      default: "INR"
    },

    isSystemAccount: {
      type: Boolean,
      default: false // prevents deletion (Cash, Sales, Tax etc.)
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },

    metadata: {
      type: Map,
      of: String // industry-specific extensions
    }
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    transactionDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    referenceNumber: {
      type: String,
      index: true
    },

    transactionType: {
      type: String,
      enum: ["JOURNAL", "PAYMENT", "RECEIPT", "TRANSFER", "ADJUSTMENT"],
      required: true
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "COMPLETED", "REVERSED"],
      default: "COMPLETED"
    },

    currency: {
      type: String,
      default: "INR"
    },

    exchangeRate: {
      type: Number,
      default: 1
    },

    entries: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
          required: true
        },
        debit: {
          type: Number,
          default: 0
        },
        credit: {
          type: Number,
          default: 0
        }
      }
    ],

    category: {
      type: String, // Sales, Purchase, Salary, Tax
      index: true
    },

    relatedModule: {
      type: String,
      enum: ["INVENTORY", "HR", "PROJECTS", "SALES", "CRM", "NONE"],
      default: "NONE"
    },

    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId // orderId, employeeId etc.
    },

    description: String,

    attachments: [
      {
        url: String,
        name: String
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);


const Account = mongoose.model("Account", accountSchema);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Account, Transaction };
