const { SalaryStructure, EmployeeSalary, Payroll } = require("../../models/hrms.model");
const User = require("../../models/user.model");

// ================= STRUCTURES =================

const handleCreateStructure = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { name, earnings, deductions, description } = req.body;

        const structure = await SalaryStructure.create({
            businessId,
            name,
            description,
            earnings,
            deductions
        });

        res.status(201).json({ success: true, data: structure });
    } catch (error) {
        console.error("Create Structure Error:", error);
        res.status(500).json({ success: false, message: "Failed to create payroll structure" });
    }
};

const handleGetStructures = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const structures = await SalaryStructure.find({ businessId, isActive: true });
        res.status(200).json({ success: true, data: structures });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch structures" });
    }
};

// ================= EMPLOYEE CONFIGURATION =================

const handleAssignSalary = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { userId, structureId, baseSalary, paymentDetails } = req.body;

        const structure = await SalaryStructure.findById(structureId);
        if (!structure) return res.status(404).json({ success: false, message: "Structure not found" });

        // Calculate components
        // Note: hrms model doesn't store computed arrays in EmployeeSalary, only netSalary.
        // But for the sake of frontend display I might want to calculate Net here.

        let netSalary = baseSalary; // Start with base

        // Calculate earnings (if percentage of base)
        let totalEarnings = 0;
        structure.earnings.forEach(comp => {
            if (comp.type === "FIXED") totalEarnings += comp.value;
            else totalEarnings += (baseSalary * comp.value) / 100;
        });

        // Assumption: Base Salary IS the Basic usually, or CTC?
        // Let's assume Base Salary + Fixed Allowances like Transport
        // If Base Salary is "Basic", then HRA might be % of Basic.
        // For simplicity: Base Salary is the input number.

        let totalDeductions = 0;
        structure.deductions.forEach(comp => {
            if (comp.type === "FIXED") totalDeductions += comp.value;
            else totalDeductions += (baseSalary * comp.value) / 100;
        });

        // If structure earnings are ADDITIVE to Base Salary ? 
        // Or is "Basic" one of the earnings?
        // Users often set CTC.
        // Let's assume standard model where Base Salary input IS the 'Basic' component value.
        // All other % components are calculated on this Base.
        // Fixed components are added.

        // Actually, let's look at the generated payroll logic below.

        // I will just save the config.

        const salaryConfig = await EmployeeSalary.findOneAndUpdate(
            { userId, businessId },
            {
                structureId,
                baseSalary,
                paymentDetails,
                netSalary: (baseSalary + totalEarnings) - totalDeductions // Rough estimate
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: salaryConfig });
    } catch (error) {
        console.error("Assign Salary Error:", error);
        res.status(500).json({ success: false, message: "Failed to assign salary" });
    }
};

const handleGetEmployeeSalaries = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const salaries = await EmployeeSalary.find({ businessId })
            .populate("userId", "name email role")
            .populate("structureId", "name");
        res.status(200).json({ success: true, data: salaries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch employee salaries" });
    }
};

// ================= PROCESS PAYROLL =================

const handleGeneratePayroll = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { month, year } = req.body;

        // Get all active employee configurations
        const salaryConfigs = await EmployeeSalary.find({ businessId }).populate('structureId');

        const slips = [];

        for (const config of salaryConfigs) {
            // Check if slip already exists
            const exists = await Payroll.findOne({ businessId, employeeId: config.userId, month, year });
            if (exists) continue;

            const structure = config.structureId;
            if (!structure) continue;

            // Calculate Earnings
            const earnings = structure.earnings.map(comp => {
                let amount = comp.value;
                if (comp.type === 'PERCENTAGE') {
                    amount = (config.baseSalary * comp.value) / 100;
                }
                return { name: comp.name, amount };
            });

            // Add Basic as "Basic Salary"? Or is it in structure?
            // If user enters Base Salary, let's treat it as "Basic Salary" component implicitly or explicitly?
            // I'll add Base Salary as explicit Earning "Basic Salary"
            earnings.unshift({ name: "Basic Salary", amount: config.baseSalary });

            // Calculate Deductions
            const deductions = structure.deductions.map(comp => {
                let amount = comp.value;
                if (comp.type === 'PERCENTAGE') {
                    amount = (config.baseSalary * comp.value) / 100;
                }
                return { name: comp.name, amount };
            });

            const totalEarnings = earnings.reduce((a, b) => a + b.amount, 0);
            const totalDeductions = deductions.reduce((a, b) => a + b.amount, 0);

            const slip = await Payroll.create({
                businessId,
                employeeId: config.userId,
                month,
                year,
                salaryStructureId: structure._id,
                earnings,
                deductions,
                grossSalary: totalEarnings,
                totalDeductions,
                netPayable: totalEarnings - totalDeductions,
                status: "DRAFT",
                paymentStatus: "UNPAID"
            });
            slips.push(slip);
        }

        res.status(200).json({ success: true, message: `Generated ${slips.length} salary slips`, data: slips });
    } catch (error) {
        console.error("Generate Payroll Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate payroll" });
    }
};

const handleGetSalarySlips = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { month, year, status } = req.query;

        const query = { businessId };
        if (month) query.month = month;
        if (year) query.year = year;
        if (status) query.status = status;

        const slips = await Payroll.find(query)
            .populate("employeeId", "name email") // Changed from userId to employeeId
            .populate("approvedBy", "name")
            .sort({ year: -1, month: -1 });

        res.status(200).json({ success: true, data: slips });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch salary slips" });
    }
};

const handleUpdateSlipStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PENDING_APPROVAL, APPROVED, PAID
        const businessId = req.user.businessId._id;

        const updates = { status };
        if (status === "APPROVED") {
            updates.approvedBy = req.user._id;
        }
        if (status === "PAID") {
            updates.paymentDate = new Date();
            updates.paymentStatus = "PAID";
        }

        const slip = await Payroll.findOneAndUpdate(
            { _id: id, businessId },
            updates,
            { new: true }
        );

        res.status(200).json({ success: true, data: slip });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

module.exports = {
    handleCreateStructure,
    handleGetStructures,
    handleAssignSalary,
    handleGetEmployeeSalaries,
    handleGeneratePayroll,
    handleGetSalarySlips,
    handleUpdateSlipStatus
};
