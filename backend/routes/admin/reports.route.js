const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth/authMiddleware");
const { userRoleMiddleware } = require("../../middleware/role/businessRoleMiddleware");
const { handleGetReportSummary, handleFetchReportData, handleGenerateReport, handleGenerateReportPDF, handleSaveReport, handleGetSavedReports, handleDeleteReport, handleGetReportById } = require("../../controllers/admin/reports.control");

// Reports Routes
router.get("/summary", authMiddleware, userRoleMiddleware, handleGetReportSummary);
router.post("/fetch-data", authMiddleware, userRoleMiddleware, handleFetchReportData);
router.post("/generate", authMiddleware, userRoleMiddleware, handleGenerateReport);
router.post("/generate/pdf", authMiddleware, userRoleMiddleware, handleGenerateReportPDF);
router.post('/save', authMiddleware, userRoleMiddleware, handleSaveReport);
router.get('/saved', authMiddleware, userRoleMiddleware, handleGetSavedReports);
router.get('/saved/:id', authMiddleware, userRoleMiddleware, handleGetReportById);
router.delete('/saved/:id', authMiddleware, userRoleMiddleware, handleDeleteReport);

module.exports = router;
