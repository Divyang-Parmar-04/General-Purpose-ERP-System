
const User = require("../../models/user.model");
const Department = require("../../models/departments.model");
const Task = require("../../models/task.model")

const bcrypt = require("bcryptjs");
const sendMail = require("../../utils/nodemailer.util");
const crypto = require("crypto");


const handleGetAllEmployees = async (req, res) => {
    try {

        const employees = await User.find({
            "role.name": "EMPLOYEE",
            businessId: req.user.businessId
        })
            .populate("departmentId", "name")
            .populate("managerId", "name email");



        res.status(200).json(employees);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const handleCreateEmployee = async (req, res) => {
    try {
        const { name, email, phone, departmentId, managerId, dateOfJoining, role } = req.body;

        // 1. Generate Random Password
        const rawPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 2. Create User
        const employee = await User.create({
            name,
            email,
            phone: phone || "0000000000",
            password: hashedPassword,
            departmentId: departmentId || null,
            managerId: managerId || null,
            dateOfJoining: dateOfJoining || new Date(),
            businessId: req.user.businessId,
            status: "INACTIVE",
            role: {
                name: "EMPLOYEE",
                description: role?.description || "Company Employee",
                isSystemRole: false,
                permissions: role?.permissions || [],
                domain: role?.domain || "",
                modules: role?.modules || []
            }
        });

        // 3. Update Department Count
        if (departmentId) {
            await Department.findByIdAndUpdate(departmentId, {
                $inc: { totalEmployees: 1 }
            });
        }

        // 4. Send Credentials Email
        try {
            await sendMail({
                to: email,
                action: "SEND_CREDENTIALS",
                data: {
                    email: email,
                    password: rawPassword
                }
            });
        } catch (mailError) {
            console.log("Mail failed but user created:", mailError);
        }

        res.status(201).json({ success: true, employee });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const handleUpdateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, status, departmentId, managerId, role } = req.body;

        const oldEmployee = await User.findById(id);

        // Handle department change count
        if (departmentId && oldEmployee.departmentId?.toString() !== departmentId) {
            // Decr old
            if (oldEmployee.departmentId) {
                await Department.findByIdAndUpdate(oldEmployee.departmentId, { $inc: { totalEmployees: -1 } });
            }
            // Incr new
            await Department.findByIdAndUpdate(departmentId, { $inc: { totalEmployees: 1 } });
        }

        // console.log(role)

        const updated = await User.findById(id);

        updated.email = email;
        updated.status = status;
        updated.departmentId = departmentId;
        updated.managerId = managerId || null;

        updated.role.modules = role.modules || [];
        updated.role.permissions = role.permissions || [];
        updated.role.domain = role.domain || "";

        await updated.save();


        // console.log(updated)


        res.status(200).json({ success: true, employee: updated });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

const handledeleteEmployee = async (req, res) => {

    try {
        const { id } = req.params;

        // 1 Check if employee manages others
        const managesOthers = await User.exists({ managerId: id });
        if (managesOthers) {
            return res.status(400).json({
                success: false,
                message: "Employee manages other employees. Reassign them first."
            });
        }

        // 2 Check task assignments
        const hasTasks = await Task.exists({
            $or: [{ assignedTo: id }, { assignedBy: id }]
        });

        if (hasTasks) {
            return res.status(400).json({
                success: false,
                message: "Employee is assigned to tasks. Remove tasks first."
            });
        }

        // 3 Delete employee

        const user = await User.findById(id)

        if (user?.departmentId) {
            await Department.findByIdAndUpdate(user?.departmentId, {
                $inc: { totalEmployees: -1 }
            });
        }

        await user.deleteOne()

        res.json({
            success: true,
            message: "Employee deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const handleUpdateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;

        await user.save();

        res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    handleGetAllEmployees,
    handleCreateEmployee,
    handleUpdateEmployee,
    handledeleteEmployee,
    handleUpdateUserProfile
};

