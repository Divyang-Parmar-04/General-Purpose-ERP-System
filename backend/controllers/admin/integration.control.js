const Integration = require("../../models/integration.model");

// Get All Integrations
const handleGetIntegrations = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const integrations = await Integration.find({ businessId });
        res.status(200).json({ success: true, data: integrations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching integrations" });
    }
};

// Update/Toggle Integration
const handleToggleIntegration = async (req, res) => {
    try {
        const { id } = req.params;
        const integration = await Integration.findById(id);
        if (!integration) return res.status(404).json({ success: false, message: "Integration not found" });

        integration.status = integration.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
        await integration.save();

        res.status(200).json({ success: true, data: integration });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error toggling integration" });
    }
};

module.exports = {
    handleGetIntegrations,
    handleToggleIntegration
};
