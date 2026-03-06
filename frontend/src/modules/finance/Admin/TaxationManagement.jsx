import React, { useEffect, useState } from 'react';
import {
  Calculator,
  FileText,
  RefreshCw,
  Search,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { getTaxSummary } from '../../../utils/admin/taxation.util';
import toast from 'react-hot-toast';

const TaxationManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getTaxSummary();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || 'Failed to load tax summary');
      }
    } catch (error) {
      console.error('Tax Summary Error:', error);
      toast.error('Failed to load taxation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '—';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Calculator className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Taxation
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                GST • Compliance • Tax Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

          
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Output Tax (Sales)
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(data?.outputTax)}
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Input Tax Credit
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(data?.inputTax)}
            </h2>
          </div>

          <div className="bg-blue-600 text-white rounded-lg p-6 shadow-sm">
            <p className="text-sm opacity-90 mb-2">Net Tax Payable</p>
            <h2 className="text-3xl font-bold">
              {formatCurrency(data?.netTaxPayable)}
            </h2>
          </div>
        </div>

        {/* Tax Records Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%]">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Tax Transactions
            </h3>
            <div className="relative w-64">
              <Search className="absolute dark:text-white left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search ref or category..."
                className="w-full pl-10 pr-4 py-2 border dark:text-white border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
          </div>

          <table className="w-full text-sm dark:text-white w-[90vw] md:w-[100%] overflow-x-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Reference</th>
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Tax Category</th>
                <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Tax Amount</th>
                <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Filing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    Loading tax records...
                  </td>
                </tr>
              ) : !data?.records?.length ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No tax transactions recorded yet
                  </td>
                </tr>
              ) : (
                data.records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{rec.ref || `TX-${idx + 1000}`}</td>
                    <td className="p-4">
                      <div className="font-medium">{rec.type || 'GST'}</div>
                      <div className="text-xs text-gray-500">18% rate</div>
                    </td>
                    <td className="p-4 text-center font-medium">
                      {formatCurrency(rec.taxAmount)}
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                      {new Date(rec.date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxationManagement;