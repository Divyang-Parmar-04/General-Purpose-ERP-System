
const Task = require("../../models/task.model");
const Department = require("../../models/departments.model");

const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinary.util");

// 1. Get all tasks assigned to the current employee + filters
const getMyTasks = async (req, res) => {
  try {
    // const { assignmentType, status } = req.query; // filters: "USER", "DEPARTMENT", or "PENDING", "IN_PROGRESS", "COMPLETED"

    const filter = {
      businessId: req.user.businessId,
      assignedTo: req.user._id,
    };

    // if (assignmentType && ["USER", "DEPARTMENT"].includes(assignmentType)) {
    //   filter.assignmentType = assignmentType;
    // }

    // if (status && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
    //   filter.status = status;
    // }

    const tasks = await Task.find(filter)
      .populate("assignedBy", "name email")
      .populate("departmentId", "name")
      .populate("createdBy", "name")
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update task status + add new documents (employee can usually only update status & attach files)
const updateMyTask = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.body)
    const { status, deleteDocuments } = req.body;
    const files = req.files || [];

    const task = await Task.findOne({
      _id: id,
      businessId: req.user.businessId,
      assignedTo: req.user._id, // important: only own tasks
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or not assigned to you" });
    }

    // Only allow status change (you can extend later if needed)
    if (status && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      task.status = status;
    }

    // Handle document deletion (if employee is allowed — optional)
    if (deleteDocuments) {
      const docsToDelete = Array.isArray(deleteDocuments) ? deleteDocuments : [deleteDocuments];
      for (const docUrl of docsToDelete) {
        const doc = task.documents.find((d) => d.url === docUrl);
        if (doc && doc.publicId) {
          await deleteFromCloudinary(doc.publicId, doc.resourceType || "auto");
        }
        task.documents = task.documents.filter((d) => d.url !== docUrl);
      }
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
            resourceType: result.resource_type,
          });
        }
      }
    }

    await task.save();

    // Re-populate for response
    const updatedTask = await Task.findById(task._id)
      .populate("assignedBy", "name email")
      .populate("departmentId", "name");

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Update My Task Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create task – only if permission exists
const createTask = async (req, res) => {
  try {
    // Check permission
    if (!req.user.role?.permissions?.includes("create_task")) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create tasks",
      });
    }

    const { title, description, assignedTo, priority, dueDate, assignmentType, departmentId } = req.body;
    const files = req.files || [];

    let uploadedDocuments = [];
    if (files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file.path);
        if (result) {
          uploadedDocuments.push({
            name: file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        }
      }
    }

    const taskData = {
      title: title.trim(),
      description,
      businessId: req.user.businessId,
      assignedBy: req.user._id,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      documents: uploadedDocuments,
      status: "PENDING",
      assignmentType: assignmentType || "USER",
    };

    let createdTasks = [];

    if (assignmentType === "DEPARTMENT" && departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) return res.status(404).json({ success: false, message: "Department not found" });

      taskData.departmentId = departmentId;
      taskData.assignedTo = dept.managerId || null;

      const newTask = await Task.create(taskData);
      createdTasks.push(newTask);
    } else if (assignmentType === "USER" && assignedTo) {
      const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      for (const empId of assignees) {
        if (!empId) continue;
        const newTask = await Task.create({
          ...taskData,
          assignedTo: empId,
        });
        createdTasks.push(newTask);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid assignment type or missing data" });
    }

    res.status(201).json({ success: true, data: createdTasks });
  } catch (error) {
    console.error("Employee Create Task Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getMyTasks,
  updateMyTask,
  createTask,
};