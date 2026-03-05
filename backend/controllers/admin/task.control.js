
const Task = require("../../models/task.model");
const User = require("../../models/user.model");
const Department = require("../../models/departments.model");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinary.util");
const { createAndSendNotification } = require("../../utils/notification.util");

const handleGetAllTasks = async (req, res) => {
    try {
        // console.log(req.user._id);
        const tasks = await Task.find({ businessId: req.user.businessId, assignedBy: req.user._id })
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleCreateTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, assignmentType, departmentId } = req.body;
        const files = req.files;

        let uploadedDocuments = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const result = await uploadToCloudinary(file.path);
                if (result) {
                    uploadedDocuments.push({
                        name: file.originalname,
                        url: result.secure_url,
                        publicId: result.public_id,
                        resourceType: result.resource_type
                    });
                }
            }
        }

        let taskData = {
            title,
            description,
            businessId: req.user.businessId,
            assignedBy: req.user._id,
            priority: priority || "MEDIUM",
            dueDate: dueDate || null,
            documents: uploadedDocuments,
            status: "PENDING",
            assignmentType: assignmentType || "USER"
        };


        if (assignmentType === "DEPARTMENT") {
            const dept = await Department.findById(departmentId);
            if (!dept) return res.status(404).json({ error: "Department not found" });

            taskData.departmentId = departmentId;
            taskData.assignedTo = dept.managerId || null;

            const newTask = await Task.create(taskData);

            if (newTask.assignedTo) {

                await createAndSendNotification({
                    businessId: req.user.businessId._id,
                    recipient: newTask.assignedTo,
                    sender: req.user._id,
                    title: "New Task Assigned",
                    message: title,
                    type: "TASK",
                    relatedId: newTask._id
                });
            }

            return res.status(201).json({ success: true, tasks: [newTask] });
        } else {
            const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
            const createdTasks = [];
            for (const empId of assignees) {
                if (!empId) continue;
                const newTask = await Task.create({
                    ...taskData,
                    assignedTo: empId
                });
                createdTasks.push(newTask);

                await createAndSendNotification({
                    businessId: req.user.businessId._id,
                    recipient: empId,
                    sender: req.user._id,
                    title: "New Task Assigned",
                    message: title,
                    type: "TASK",
                    relatedId: newTask._id
                });
            }
            return res.status(201).json({ success: true, tasks: createdTasks });
        }

    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ error: error.message });
    }
};

const handleUpdateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, priority, assignedTo, status, deleteDocuments, assignmentType, departmentId } = req.body;
        const files = req.files;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        // Handle document deletion from Cloudinary and DB
        if (deleteDocuments) {
            const docsToDelete = Array.isArray(deleteDocuments) ? deleteDocuments : [deleteDocuments];
            for (const docUrl of docsToDelete) {
                const doc = task.documents.find(d => d.url === docUrl);
                if (doc && doc.publicId) {
                    await deleteFromCloudinary(doc.publicId, doc.resourceType || "auto");
                }
                task.documents = task.documents.filter(d => d.url !== docUrl);
            }
        }

        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (status) task.status = status;

        if (assignmentType) {
            task.assignmentType = assignmentType;
            if (assignmentType === "DEPARTMENT" && departmentId) {
                const dept = await Department.findById(departmentId);
                task.departmentId = departmentId;
                task.assignedTo = dept?.managerId || null;
            } else if (assignmentType === "USER" && assignedTo) {
                task.assignedTo = assignedTo;
                task.departmentId = null;
            }
        } else if (assignedTo) {
            task.assignedTo = assignedTo;
        }

        // Upload new documents
        if (files && files.length > 0) {
            for (const file of files) {
                const result = await uploadToCloudinary(file.path);
                if (result) {
                    task.documents.push({
                        name: file.originalname,
                        url: result.secure_url,
                        publicId: result.public_id,
                        resourceType: result.resource_type
                    });
                }
            }
        }

        await task.save();

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({ error: error.message });
    }
};

const handleDeleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) return res.status(404).json({ error: "Task not found" });

        if (task.status !== "COMPLETED") {
            return res.status(400).json({ error: "Only completed tasks can be deleted" });
        }

        // Delete all associated files from Cloudinary
        if (task.documents && task.documents.length > 0) {
            for (const doc of task.documents) {
                if (doc.publicId) {
                    await deleteFromCloudinary(doc.publicId, doc.resourceType || "auto");
                }
            }
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Task and associated files deleted" });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    handleGetAllTasks,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask
};
