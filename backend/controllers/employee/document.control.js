const Document = require("../../models/document.model");

// Get all business-visible documents for employee
const handleGetBusinessDocuments = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { documentType, folder, search } = req.query;

        const query = {
            businessId,
            visibility: "BUSINESS",
            status: "ACTIVE"
        };

        // Apply filters
        if (documentType && documentType !== 'ALL') {
            query.documentType = documentType;
        }

        if (folder && folder !== 'ALL') {
            query.folder = folder;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error("Get Business Documents Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch documents" });
    }
};

// Get single document by ID (only if visibility is BUSINESS)
const handleGetDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const document = await Document.findOne({
            _id: id,
            businessId,
            visibility: "BUSINESS",
            status: "ACTIVE"
        }).populate('uploadedBy', 'name email');

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found or not accessible" });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        console.error("Get Document Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch document" });
    }
};

// Get unique folders for filtering
const handleGetFolders = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        const folders = await Document.distinct('folder', {
            businessId,
            visibility: "BUSINESS",
            status: "ACTIVE"
        });

        res.status(200).json({ success: true, data: folders });
    } catch (error) {
        console.error("Get Folders Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch folders" });
    }
};

// Get unique document types for filtering
const handleGetDocumentTypes = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        const types = await Document.distinct('documentType', {
            businessId,
            visibility: "BUSINESS",
            status: "ACTIVE"
        });

        res.status(200).json({ success: true, data: types });
    } catch (error) {
        console.error("Get Document Types Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch document types" });
    }
};

module.exports = {
    handleGetBusinessDocuments,
    handleGetDocumentById,
    handleGetFolders,
    handleGetDocumentTypes
};
