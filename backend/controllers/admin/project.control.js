const Project = require("../../models/project.model");

// Create a new project
const handleCreateProject = async (req, res) => {
    try {
        const { name, description, clientId, startDate, endDate, status, priority, budget, members, tags } = req.body;
        const businessId = req.user.businessId._id;

        const project = await Project.create({
            businessId,
            name,
            description,
            clientId,
            startDate,
            endDate,
            status,
            priority,
            budget,
            members,
            tags,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating project"
        });
    }
};

// Get all projects for a business
const handleGetAllProjects = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const projects = await Project.find({ businessId })
            .populate("clientId")
            .populate("members.user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error("Get Projects Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects"
        });
    }
};

// Update a project
const handleUpdateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const project = await Project.findByIdAndUpdate(id, updates, { new: true });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (error) {
        console.error("Update Project Error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating project"
        });
    }
};

// Delete a project
const handleDeleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project"
        });
    }
};

module.exports = {
    handleCreateProject,
    handleGetAllProjects,
    handleUpdateProject,
    handleDeleteProject
};
