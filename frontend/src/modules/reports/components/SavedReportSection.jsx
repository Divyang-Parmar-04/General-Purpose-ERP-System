// Saved Reports Component
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSavedReports , getReportById , deleteReport } from '../../../utils/admin/reports.util'

const SavedReportsSection = ({refresh}) => {

  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [viewingReport, setViewingReport] = useState(null);

  const fetchSavedReports = async () => {
    try {
      setLoading(true);
      const res = await getSavedReports(filterType);
      if (res.success) {
        setSavedReports(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedReports();
  }, [filterType , refresh]);

  const handleView = async (id) => {
    try {
      const res = await getReportById(id);
      if (res.success) {
        setViewingReport(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load report');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await deleteReport(id);
      if (res.success) {
        toast.success('Report deleted successfully');
        fetchSavedReports();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white w-[90vw] md:w-[100%] border border-gray-200 dark:border-gray-800 rounded-lg md:p-6 p-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Saved Reports</h3>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
        >
          <option value="ALL">All Types</option>
          <option value="SUMMARY">Summary</option>
          <option value="SALES">Sales</option>
          <option value="FINANCE">Finance</option>
          <option value="PROJECT">Project</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="INVENTORY">Inventory</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : savedReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No saved reports found</div>
      ) : (
        <div className="space-y-3">
          {savedReports.map((report) => (
            <div
              key={report._id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{report.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                    {report.type}
                  </span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(report._id)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(report._id)}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{viewingReport.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Open HTML in new window and trigger print dialog for PDF
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(viewingReport.content);
                    printWindow.document.close();

                    // Wait for content to load, then trigger print
                    printWindow.onload = () => {
                      printWindow.focus();
                      printWindow.print();
                    };

                    toast.success('Opening print dialog...');
                  }}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                srcDoc={viewingReport.content}
                className="w-full h-full min-h-[600px] border-0"
                title="Report Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedReportsSection;