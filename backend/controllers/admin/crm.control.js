const Lead = require("../../models/crm.model");

// Create Lead
const handleCreateLead = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const lead = await Lead.create({
            ...req.body,
            businessId,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, message: "Lead created successfully", data: lead });
    } catch (error) {
        console.error("Create Lead Error:", error);
        res.status(500).json({ success: false, message: "Error creating lead" });
    }
};

// Get All Leads
const handleGetLeads = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const leads = await Lead.find({ businessId })
            .populate("assignedTo", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        console.error("Get Leads Error:", error);
        res.status(500).json({ success: false, message: "Error fetching leads" });
    }
};

// Update Lead Status/Details
const handleUpdateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findByIdAndUpdate(id, req.body, { new: true });

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        res.status(200).json({ success: true, message: "Lead updated successfully", data: lead });
    } catch (error) {
        console.error("Update Lead Error:", error);
        res.status(500).json({ success: false, message: "Error updating lead" });
    }
};

// Delete Lead
const handleDeleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findByIdAndDelete(id);

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        res.status(200).json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
        console.error("Delete Lead Error:", error);
        res.status(500).json({ success: false, message: "Error deleting lead" });
    }
};

module.exports = {
    handleCreateLead,
    handleGetLeads,
    handleUpdateLead,
    handleDeleteLead
};
