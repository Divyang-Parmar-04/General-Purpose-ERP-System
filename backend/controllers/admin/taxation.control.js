const { Transaction } = require("../../models/finance.model");
const Sales = require("../../models/sales.model");

// Get Tax Summary (GST/VAT)
const handleGetTaxSummary = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        // Fetch Sales for Output Tax
        const sales = await Sales.find({ businessId, status: "PAID" });
        const outputTax = sales.reduce((sum, s) => sum + (s.totalTax || 0), 0);

        // Fetch Transactions for Input Tax (assuming category identifies tax-related entries)
        const inputTx = await Transaction.find({ businessId, category: "Purchase", status: "COMPLETED" });
        // This is a simplified logic – usually taxes are calculated per item in POs too
        const inputTax = 0; // Placeholder for logic refinement

        res.status(200).json({
            success: true,
            data: {
                outputTax,
                inputTax,
                netTaxPayable: outputTax - inputTax,
                records: sales.map(s => ({
                    ref: s.invoiceNumber || s.orderNumber,
                    date: s.paymentDate || s.updatedAt,
                    taxAmount: s.totalTax,
                    type: "OUTPUT"
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching tax summary" });
    }
};

module.exports = {
    handleGetTaxSummary
};
