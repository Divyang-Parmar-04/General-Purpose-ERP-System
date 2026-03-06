import React, { useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Download,
  FileText,
  Eye,
  Sparkles,
  Save,
  Printer,
  FileDown
} from "lucide-react";
import { fetchReportData, generateReport, saveReport } from "../../../utils/admin/reports.util";
import { saveAs } from 'file-saver';
import toast from "react-hot-toast";
import SavedReportsSection from "../components/SavedReportSection";

const ReportsManagement = () => {
  const [reportType, setReportType] = useState('SUMMARY');
  const [filters, setFilters] = useState({});
  const [refresh, setRefresh] = useState(false);

  // Step 1: Raw Data
  const [fetchingData, setFetchingData] = useState(false);
  const [rawData, setRawData] = useState(null);

  // Step 2: AI Generated Report
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleFetchData = async () => {
    try {
      setFetchingData(true);
      setRawData(null);
      setGeneratedReport(null);

      const res = await fetchReportData({ type: reportType, filters });
      if (res.success) {
        setRawData(res.data);
        toast.success("Data fetched successfully");
      } else {
        toast.error(res?.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setFetchingData(false);
    }
  };

  const handleGenerateAIReport = async () => {
    if (!rawData) {
      toast.error("Please fetch data first");
      return;
    }


    try {
      setGeneratingReport(true);
      const res = await generateReport({ type: reportType, filters });
      if (res.success) {
        setGeneratedReport(res.data);
        setRawData(null);
        toast.success("AI Report generated successfully");
      } else {
        toast.error(res?.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handlePrintReport = () => {
    const iframe = document.getElementById('report-frame');
    if (iframe) {
      iframe.contentWindow.print();
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([generatedReport], { type: 'text/html' });
    saveAs(blob, `${reportType}_Report_${new Date().toISOString().slice(0, 10)}.html`);
    toast.success('Downloaded HTML report');
  };

  const handleSaveToDB = async () => {
    try {
      const res = await saveReport({
        name: `${reportType} Report - ${new Date().toLocaleDateString()}`,
        type: reportType,
        filters,
        content: generatedReport
      });
      if (res.success) {
        toast.success('Saved to History');
        setRefresh(prev => !prev);
      }
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    }
  };

  const handleReset = () => {
    setRawData(null);
    setGeneratedReport(null);
    setFilters({});
    setRefresh(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8 ">
      <div className="max-w-7xl mx-auto space-y-8 ">

        {/* Header */}
        <div className="flex flex-col bg-gray-50  w-full sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Reports & Insights
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI-Powered Business Analytics • Filter → Preview → Generate
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={handleReset}
              className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Reset"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="bg-white dark:bg-gray-900 border w-[90vw] md:w-[100%] border-gray-200 dark:text-white dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Step 1: Configure Report Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="SUMMARY">Comprehensive Summary</option>
                <option value="SALES">Sales Report</option>
                <option value="FINANCE">Finance Report</option>
                <option value="PROJECT">Project Report</option>
                <option value="EMPLOYEE">Employee Report</option>
                <option value="INVENTORY">Inventory Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                From Date
              </label>
              <input
                type="date"
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                To Date
              </label>
              <input
                type="date"
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                Status Filter
              </label>
              <input
                placeholder="e.g. ACTIVE, PAID"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleFetchData}
            disabled={fetchingData}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {fetchingData ? <RefreshCw className="animate-spin" size={18} /> : <Eye size={18} />}
            {fetchingData ? 'Fetching Data...' : 'Fetch & Preview Data'}
          </button>
        </div>

        {/* Raw Data Preview */}
        {rawData && (
          <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Step 2: Data Preview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Review the filtered data before generating AI report
                </p>
              </div>
              <button
                onClick={handleGenerateAIReport}
                disabled={generatingReport}
                className="px-6 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                {generatingReport ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {generatingReport ? 'Generating AI Report...' : 'Generate AI Report'}
              </button>
            </div>

            {/* Summary Metrics */}
            <div className="mb-6">
              <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(rawData.summary || {}).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{key}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            {rawData.rows && rawData.rows.length > 0 && (
              <div className="overflow-x-auto">
                <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Detailed Data ({rawData.rows.length} records)
                </h4>
                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                      <tr>
                        {Object.keys(rawData.rows[0]).map((header) => (
                          <th key={header} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-3 text-gray-900 dark:text-gray-100">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sections for Summary Report */}
            {rawData.sections && Object.keys(rawData.sections).length > 0 && (
              <div className="mt-6 space-y-6">
                <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">
                  Detailed Sections
                </h4>
                {Object.entries(rawData.sections).map(([sectionName, sectionData]) => (
                  <div key={sectionName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                      {sectionName}
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {sectionData[0] && Object.keys(sectionData[0]).map((header) => (
                              <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sectionData.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                              {Object.values(row).map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Generated Report */}
        {generatedReport && (
          <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-lg animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Sparkles size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">AI-Generated Report</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Professional analysis with insights and recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  title="Print or Save as PDF"
                >
                  <Printer size={16} />
                  Print/PDF
                </button>

                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FileDown size={16} />
                  HTML
                </button>

                <button
                  onClick={handleSaveToDB}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>

            <div className="w-full h-[700px] bg-white">
              <iframe
                id="report-frame"
                srcDoc={generatedReport}
                title="AI Generated Report"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!rawData && !generatedReport && (
          <div className="text-center w-[90vw] md:w-[100%] px-3 py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Report Generated Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select your report type, apply filters, and click "Fetch & Preview Data" to get started.
              You'll be able to review the raw data before generating a comprehensive AI-powered report.
            </p>
          </div>
        )}

        {/* Saved Reports Section */}
        <SavedReportsSection refresh={refresh} />

      </div>
    </div>
  );
};

export default ReportsManagement;