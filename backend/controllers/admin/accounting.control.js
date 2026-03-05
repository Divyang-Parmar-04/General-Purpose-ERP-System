const { Account, Transaction } = require("../../models/finance.model");

// Get Chart of Accounts
const handleGetCOA = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const coa = await Account.find({ businessId }).sort({ type: 1, name: 1 });
        res.status(200).json({ success: true, data: coa });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching COA" });
    }
};

// Get General Ledger (Aggregated)
const handleGetGeneralLedger = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const ledger = await Transaction.find({ businessId, status: "COMPLETED" })
            .populate("entries.accountId", "name code")
            .sort({ transactionDate: -1 });
        res.status(200).json({ success: true, data: ledger });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching Ledger" });
    }
};

// Simple Balance Sheet logic
const handleGetBalanceSheet = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const accounts = await Account.find({ businessId });

        // Note: Real balance requires aggregating all transactions + opening balance.
        // For this fix, we are just grouping accounts correctly by 'type' as per Schema.

        const balanceSheet = {
            assets: accounts.filter(a => a.type === 'ASSET'),
            liabilities: accounts.filter(a => a.type === 'LIABILITY'),
            equity: accounts.filter(a => a.type === 'EQUITY'),
            totals: {
                assets: accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + (a.openingBalance?.amount || 0), 0),
                liabilities: accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + (a.openingBalance?.amount || 0), 0),
                equity: accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + (a.openingBalance?.amount || 0), 0)
            }
        };

        res.status(200).json({ success: true, data: balanceSheet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error calculating Balance Sheet" });
    }
};

module.exports = {
    handleGetCOA,
    handleGetGeneralLedger,
    handleGetBalanceSheet
};
