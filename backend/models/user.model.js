// models/User.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    phone: {
      type: String,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      name: { type: String, required: true, index: true },
      description: { type: String, required: true, index: true },
      isSystemRole: { type: Boolean, required: true, index: true , default:false},
      permissions: [{ type: String, required: true, index: true }],
      domain : { type: String,index: true },
      modules: [{ type: String, required: true, index: true }]
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      default: null // null for Super Admin
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    // Employment Info
    dateOfJoining: {
      type: Date
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPEND","REACTIVATE"],
      default: "INACTIVE",
      index: true
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
