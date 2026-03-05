const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
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
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["INFO", "WARNING", "URGENT", "SUCCESS"],
            default: "INFO"
        },
        targetAudience: {
            type: String,
            enum: ["ALL", "ADMINS", "EMPLOYEES"],
            default: "ALL"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        },
        expiryDate: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
