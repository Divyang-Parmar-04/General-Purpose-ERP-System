const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
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
        description: String,
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead", // Assuming Leads can be converted to Clients
            index: true
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"],
            default: "NOT_STARTED",
            index: true
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "MEDIUM"
        },
        budget: {
            estimated: Number,
            actual: { type: Number, default: 0 },
            currency: { type: String, default: "INR" }
        },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                role: String // e.g., Project Manager, Developer, Designer
            }
        ],
        tags: [String],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
