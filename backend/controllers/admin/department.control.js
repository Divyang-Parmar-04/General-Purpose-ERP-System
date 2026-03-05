
const Department = require("../../models/departments.model");

const handleGetAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ businessId: req.user.businessId })
            .populate("managerId", "name email");
        res.status(200).json(departments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const handleCreateDepartment = async (req, res) => {
    try {
        const { name, description, managerId } = req.body;
        const department = await Department.create({
            name,
            description,
            managerId: managerId || null,
            businessId: req.user.businessId,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, department });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleUpdateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Department.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, department: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleDeleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (department && department.totalEmployees > 0) {
            return res.status(400).json({
                success: false,
                message: "Department has active employees. Reassign or delete employees first."
            });
        }

        await Department.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Department deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    handleGetAllDepartments,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment
};