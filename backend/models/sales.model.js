const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true
        },
        invoiceNumber: {
            type: String,
            unique: true,
            sparse: true, // Only for finalized invoices
            index: true
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead", // Linking to Lead model which acts as customer repository
            required: true,
            index: true
        },
        items: [
            {
                description: { type: String, required: true },
                quantity: { type: Number, required: true, default: 1 },
                unitPrice: { type: Number, required: true },
                taxCategory: String,
                taxAmount: { type: Number, default: 0 },
                totalPrice: { type: Number, required: true }
            }
        ],
        subTotal: { type: Number, required: true },
        totalTax: { type: Number, default: 0 },
        discount: {
            type: { type: String, enum: ["PERCENTAGE", "FLAT"], default: "FLAT" },
            value: { type: Number, default: 0 }
        },
        grandTotal: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        status: {
            type: String,
            enum: ["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "CANCELLED", "OVERDUE"],
            default: "DRAFT",
            index: true
        },
        dueDate: Date,
        paymentDate: Date,
        notes: String,
        termsAndConditions: String,
        attachments: [
            {
                name: String,
                url: String,
                publicId: String
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Sales", salesSchema);
