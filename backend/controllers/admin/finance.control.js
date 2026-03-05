const { Account, Transaction } = require("../../models/finance.model");

// ================== ACCOUNT MANAGEMENT ==================

const handleGetAccounts = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const accounts = await Account.find({ businessId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching accounts" });
    }
};

const handleCreateAccount = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const account = await Account.create({ ...req.body, businessId });
        res.status(201).json({ success: true, data: account });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating account" });
    }
};

const handleDeleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await Account.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting account" });
    }
};

// ================== TRANSACTION MANAGEMENT ==================

const handleGetTransactions = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const transactions = await Transaction.find({ businessId })
            .populate("entries.accountId", "name code") // Updated populate path
            .sort({ transactionDate: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching transactions" });
    }
};

const handleCreateTransaction = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        let { entries, fromAccount, toAccount, amount, type, ...rest } = req.body;

        // Adapter for legacy frontend requests
        if (!entries || entries.length === 0) {
            entries = [];
            // Simple logic: Credit -> To Account, Debit -> From Account
            // In double entry: 
            // Payment (Out): Credit Cash (From), Debit Expense (To)
            // Receipt (In): Debit Cash (To), Credit Income (From)

            if (fromAccount && amount) {
                entries.push({ accountId: fromAccount, credit: amount, debit: 0 });
            }
            if (toAccount && amount) {
                entries.push({ accountId: toAccount, debit: amount, credit: 0 });
            }
        }

        const transaction = await Transaction.create({
            ...rest,
            entries,
            type,
            businessId,
            createdBy: req.user._id
        });

        // Balance update removed as 'balance' field does not exist in Schema.
        // In a real system, we'd aggregate entries or have a separate Balance model.

        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error record transaction" });
    }
};

module.exports = {
    handleGetAccounts,
    handleCreateAccount,
    handleDeleteAccount,
    handleGetTransactions,
    handleCreateTransaction
};
