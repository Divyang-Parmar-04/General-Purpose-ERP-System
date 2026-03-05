const { EmployeeSalary, Payroll } = require("../../models/hrms.model");

// View own salary structure
const handleGetMySalaryConfig = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const userId = req.user._id;

        const config = await EmployeeSalary.findOne({ businessId, userId })
            .populate("structureId", "name description earnings deductions"); // Populate earnings/deductions for display

        if (!config) {
            return res.status(404).json({ success: false, message: "Salary structure not assigned" });
        }

        // Calculate estimated values based on baseSalary for display (Similar to Admin controller logic)
        // This helps frontend display exact amounts instead of just percentages
        const structure = config.structureId;
        let computedEarnings = [];
        let computedDeductions = [];

        if (structure) {
            computedEarnings.push({ name: "Basic Salary", amount: config.baseSalary });

            structure.earnings.forEach(comp => {
                let amount = comp.value;
                if (comp.type === 'PERCENTAGE') amount = (config.baseSalary * comp.value) / 100;
                computedEarnings.push({ name: comp.name, amount });
            });

            structure.deductions.forEach(comp => {
                let amount = comp.value;
                if (comp.type === 'PERCENTAGE') amount = (config.baseSalary * comp.value) / 100;
                computedDeductions.push({ name: comp.name, amount });
            });
        }

        const responseData = {
            ...config.toObject(),
            computedEarnings,
            computedDeductions,
            // Re-calculate net just in case
            netSalary: computedEarnings.reduce((a, b) => a + b.amount, 0) - computedDeductions.reduce((a, b) => a + b.amount, 0)
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("Get My Salary Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch salary details" });
    }
};

// View own salary slips (history)
const handleGetMySlips = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const userId = req.user._id;
        const { year } = req.query;

        const query = { businessId, employeeId: userId }; // Use employeeId
        if (year) query.year = year;

        // Don't show DRAFT slips to employees
        query.status = { $ne: "DRAFT" };

        const slips = await Payroll.find(query)
            .sort({ year: -1, month: -1 });

        res.status(200).json({ success: true, data: slips });
    } catch (error) {
        console.error("Get My Slips Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch salary history" });
    }
};

module.exports = {
    handleGetMySalaryConfig,
    handleGetMySlips
};
