const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true
        },
        platformName: {
            type: String, // e.g., STRIPE, PAYPAL, SLACK, GOOGLE_DRIVE
            required: true
        },
        apiKey: String,
        apiSecret: String,
        webhookUrl: String,
        config: {
            type: Map,
            of: String
        },
        status: {
            type: String,
            enum: ["CONNECTED", "DISCONNECTED", "ERROR"],
            default: "DISCONNECTED"
        },
        lastSyncedAt: Date,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Integration", integrationSchema);
