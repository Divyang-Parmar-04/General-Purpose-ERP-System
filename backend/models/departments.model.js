// models/Department.model.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    description: {
      type: String,
      trim: true
    },

    totalEmployees : {type:Number},

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate department names in same business
departmentSchema.index(
  { name: 1, businessId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Department", departmentSchema);
