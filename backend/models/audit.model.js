const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        action: {
            type: String, // e.g., CREATE, UPDATE, DELETE, LOGIN
            required: true,
            index: true
        },
        module: {
            type: String, // e.g., SALES, INVENTORY, HRMS
            required: true,
            index: true
        },
        resourceId: {
            type: mongoose.Schema.Types.String, // ID of the affected document
            index: true
        },
        details: {
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            ipAddress: String,
            userAgent: String,
            description: String
        },
        status: {
            type: String,
            enum: ["SUCCESS", "FAILURE"],
            default: "SUCCESS"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
