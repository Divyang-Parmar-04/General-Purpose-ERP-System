const mongoose = require("mongoose");

// 1. Payroll Structure Template (e.g., "Full Time Engineer", "Intern")
const payrollStructureSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    name: { type: String, required: true }, // e.g., "Engineering Grade A"
    description: String,

    // Components definition
    earnings: [{
        name: { type: String, required: true }, // e.g., "Basic", "HRA"
        type: { type: String, enum: ["FIXED", "PERCENTAGE"], default: "FIXED" },
        calculationBasis: { type: String }, // For percentage, e.g., "BASIC_SALARY"
        value: { type: Number, default: 0 }, // Default value or percentage
        isTaxable: { type: Boolean, default: true }
    }],

    deductions: [{
        name: { type: String, required: true }, // e.g., "PF", "Tax"
        type: { type: String, enum: ["FIXED", "PERCENTAGE"], default: "FIXED" },
        calculationBasis: { type: String },
        value: { type: Number, default: 0 }
    }],

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Employee Salary Configuration (Links Employee to Structure + Overrides)
const employeeSalarySchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    structureId: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollStructure" },

    // Base amount for calculations (usually CTC or Basic)
    baseSalary: { type: Number, required: true },

    paymentDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        panNumber: String
    },

    // Actual calculated components (snapshotted/overridden from structure)
    computedEarnings: [{
        name: String,
        amount: Number
    }],
    computedDeductions: [{
        name: String,
        amount: Number
    }],

    netSalary: Number,
    effectiveDate: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. Monthly Salary Slip / Transaction
const salarySlipSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },  // 2024

    basicSalary: Number,

    earnings: [{
        name: String,
        amount: Number
    }],

    deductions: [{
        name: String,
        amount: Number
    }],

    grossSalary: Number,
    totalDeductions: Number,
    netPayable: Number,

    status: {
        type: String,
        enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PAID"],
        default: "DRAFT"
    },

    paymentDate: Date,
    transactionReference: String,

    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    notes: String
}, { timestamps: true });

// Indexes to prevent duplicate slips
salarySlipSchema.index({ businessId: 1, userId: 1, month: 1, year: 1 }, { unique: true });

const PayrollStructure = mongoose.model("PayrollStructure", payrollStructureSchema);
const EmployeeSalary = mongoose.model("EmployeeSalary", employeeSalarySchema);
const SalarySlip = mongoose.model("SalarySlip", salarySlipSchema);

module.exports = { PayrollStructure, EmployeeSalary, SalarySlip };
