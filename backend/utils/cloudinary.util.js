const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

// Original function for document uploads

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "task_documents",
      resource_type: "raw",
      type: "upload"
    });

    fs.unlinkSync(localFilePath); // cleanup
    return response;

  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// New function for image uploads (inventory, products, etc)
const uploadImageToCloudinary = async (file) => {
  try {
    if (!file) return null;

    // Handle Multer file object
    const filePath = typeof file === 'string' ? file : file.path;
    
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      folder: "inventory_images",
      resource_type: "image",
      type: "upload"
    });

    // Cleanup temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return response;

  } catch (error) {
    // Cleanup on error
    const filePath = typeof file === 'string' ? file : file?.path;
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("Error cleaning up temp file:", cleanupErr);
      }
    }
    console.error("Image upload error:", error);
    throw error;
  }
};

// Function for document uploads (invoices, attachments, etc)
const uploadDocumentToCloudinary = async (file) => {
  try {
    if (!file) return null;

    // Handle Multer file object
    const filePath = typeof file === 'string' ? file : file.path;
    
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      folder: "invoice_attachments",
      resource_type: "raw",
      type: "upload"
    });

    // Cleanup temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return response;

  } catch (error) {
    // Cleanup on error
    const filePath = typeof file === 'string' ? file : file?.path;
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("Error cleaning up temp file:", cleanupErr);
      }
    }
    console.error("Document upload error:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

module.exports = { uploadToCloudinary, uploadImageToCloudinary, uploadDocumentToCloudinary, deleteFromCloudinary };
