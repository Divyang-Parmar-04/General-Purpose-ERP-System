const Document = require("../../models/document.model");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinary.util");

// Upload Document
const handleUploadDocument = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const businessId = req.user.businessId._id;
        const uploadedDocs = [];

        for (const file of req.files) {
            const result = await uploadToCloudinary(file.path);
            const doc = await Document.create({
                businessId,
                title: file.originalname, // Mapped name -> title
                file: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    type: file.mimetype.split('/')[1].toUpperCase(),
                    size: file.size
                },
                documentType: req.body.category || "OTHER", // category -> documentType
                folder: req.body.folder || "ROOT",
                uploadedBy: req.user._id // createdBy -> uploadedBy
            });
            uploadedDocs.push(doc);
        }

        res.status(201).json({ success: true, message: "Documents uploaded successfully", data: uploadedDocs });
    } catch (error) {
        console.error("Upload Document Error:", error);
        res.status(500).json({ success: false, message: "Error uploading documents" });
    }
};

// Get All Documents
const handleGetDocuments = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const documents = await Document.find({ businessId, status: "ACTIVE" })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ success: false, message: "Error fetching documents" });
    }
};

// Delete/Archive Document
const handleDeleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findById(id);

        if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

        // Delete from Cloudinary
        if (doc.file && doc.file.publicId) {
            await deleteFromCloudinary(doc.file.publicId, "raw");
        }

        // Delete From DB
        await doc.deleteOne()

        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        console.error("Delete Document Error:", error);
        res.status(500).json({ success: false, message: "Error deleting document" });
    }
};

module.exports = {
    handleUploadDocument,
    handleGetDocuments,
    handleDeleteDocument
};
