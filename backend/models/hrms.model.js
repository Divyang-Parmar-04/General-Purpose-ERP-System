const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift"
    },

    sessions: [
      {
        clockIn: Date,
        clockOut: Date,
        location: {
          lat: Number,
          lng: Number,
          address: String
        }
      }
    ],

    totalWorkMinutes: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALFDAY", "LEAVE", "HOLIDAY"],
      default: "PRESENT"
    },

    source: {
      type: String,
      enum: ["MANUAL", "BIOMETRIC", "MOBILE", "WEB"],
      default: "WEB"
    },

    remarks: String
  },
  { timestamps: true }
);

const leaveSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    leaveType: {
      type: String
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ["DAY", "HALF_DAY", "HOUR"],
        default: "DAY"
      }
    },

    reason: String,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedAt: Date
  },
  { timestamps: true }
);

const salaryStructureSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  name: { type: String, required: true },
  description: String,
  earnings: [{
    name: { type: String, required: true },
    type: { type: String, enum: ["FIXED", "PERCENTAGE"], default: "FIXED" },
    value: { type: Number, default: 0 },
    calculationBasis: { type: String } // e.g., "BASIC"
  }],
  deductions: [{
    name: { type: String, required: true },
    type: { type: String, enum: ["FIXED", "PERCENTAGE"], default: "FIXED" },
    value: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


const employeeSalarySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  structureId: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryStructure" },
  baseSalary: { type: Number, required: true },
  paymentDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    panNumber: String
  },
  netSalary: Number,
  effectiveDate: { type: Date, default: Date.now }
}, { timestamps: true });


const payrollSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    month: { type: Number, required: true },
    year: { type: Number, required: true },

    salaryStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure"
    },

    earnings: [
      {
        name: String,
        amount: Number,
        taxable: Boolean
      }
    ],

    deductions: [
      {
        name: String,
        amount: Number
      }
    ],

    overtime: {
      hours: Number,
      amount: Number
    },

    bonus: {
      name: String,
      amount: Number
    },

    grossSalary: Number,
    totalDeductions: Number,
    netPayable: Number,

    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PAID"],
      default: "DRAFT"
    },

    paymentStatus: { // Keeping for backward compat if needed, but status above covers it
      type: String,
      enum: ["UNPAID", "PAID", "PROCESSING"],
      default: "UNPAID"
    },

    paymentDate: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    financeTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    }
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
const Leave = mongoose.model("Leave", leaveSchema);
const SalaryStructure = mongoose.model("SalaryStructure", salaryStructureSchema);
const EmployeeSalary = mongoose.model("EmployeeSalary", employeeSalarySchema);
const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = { Attendance, Leave, SalaryStructure, EmployeeSalary, Payroll };
