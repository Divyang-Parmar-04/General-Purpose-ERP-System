import React, { useEffect, useState } from 'react';
import {
  Calculator,
  BookOpen,
  Scale,
  RefreshCw,
  Search,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { getCOA, getGeneralLedger, getBalanceSheet } from '../../../utils/admin/accounting.util';
import toast from 'react-hot-toast';

const AccountingManagement = () => {
  const [activeTab, setActiveTab] = useState('COA');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'COA', label: 'Chart of Accounts' },
    { id: 'LEDGER', label: 'General Ledger' },
    { id: 'BALANCE_SHEET', label: 'Balance Sheet' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === 'COA') result = await getCOA();
      else if (activeTab === 'LEDGER') result = await getGeneralLedger();
      else if (activeTab === 'BALANCE_SHEET') result = await getBalanceSheet();

      if (result?.success) {
        setData(result.data);
      } else {
        toast.error(result?.message || `Failed to load ${activeTab.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Fetch ${activeTab} Error:`, error);
      toast.error(`Failed to load ${activeTab.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const formatCurrency = (amount) =>
    amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '—';

  const getBalanceColor = (amount) =>
    amount > 0 ? 'text-green-700 dark:text-green-400' : amount < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300';

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
                Accounting
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ledger • Accounts • Financial Statements
              </p>
            </div>
          </div>
          <div>

            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%]">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading {activeTab.toLowerCase().replace('_', ' ')}...
            </div>
          ) : !data || (Array.isArray(data) && data.length === 0) ? (
            <div className="py-16 text-center text-gray-500">
              No {activeTab.toLowerCase().replace('_', ' ')} data available
            </div>
          ) : (
            <>
              {activeTab === 'COA' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300">Account Name</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {data.length > 0 && data?.map((acc) => (
                      <tr key={acc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{acc.name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{acc.type}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          <span className={getBalanceColor(acc.openingBalance?.amount)}>
                            {formatCurrency(acc.openingBalance?.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'LEDGER' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">Reference</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {data.length > 0 && data?.map((tx) => {
                      const credit = tx.entries?.reduce((sum, e) => sum + (e.credit || 0), 0) || 0;
                      const debit = tx.entries?.reduce((sum, e) => sum + (e.debit || 0), 0) || 0;
                      const net = credit - debit;
                      const isCredit = net >= 0;

                      return (
                        <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                            {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{tx.description || tx.category || '—'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx.category || 'Journal'}</div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            {tx.referenceNumber || '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            <span className={isCredit ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                              {isCredit ? '+' : '-'} {formatCurrency(Math.abs(net))}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeTab === 'BALANCE_SHEET' && data && (
                <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Assets */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                        Assets
                      </h3>
                      <div className="space-y-3">
                        {data?.assets?.length > 0 && data?.assets?.map((a) => (
                          <div key={a._id} className="flex justify-between items-center text-sm py-2">
                            <span className="text-gray-700 dark:text-gray-300">{a.name}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(a.openingBalance?.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-semibold text-lg">
                        <span className="text-gray-900 dark:text-gray-100">Total Assets</span>
                        <span className="text-green-700 dark:text-green-400">
                          {formatCurrency(data?.totals?.assets)}
                        </span>
                      </div>
                    </div>

                    {/* Liabilities & Equity */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                        Liabilities & Equity
                      </h3>
                      <div className="space-y-3">
                        {data?.liabilities?.map((l) => (
                          <div key={l._id} className="flex justify-between items-center text-sm py-2">
                            <span className="text-gray-700 dark:text-gray-300">{l.name}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(l.openingBalance?.amount)}</span>
                          </div>
                        ))}
                        {data?.equity?.map((e) => (
                          <div key={e._id} className="flex justify-between items-center text-sm py-2">
                            <span className="text-gray-700 dark:text-gray-300">{e.name}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(e.openingBalance?.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-semibold text-lg">
                        <span className="text-gray-900 dark:text-gray-100">Total Liabilities & Equity</span>
                        <span className="text-green-700 dark:text-green-400">
                          {formatCurrency(
                            (data?.totals?.liabilities || 0) + (data?.totals?.equity || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-6 text-sm text-gray-500 dark:text-gray-400 italic">
                    Balanced as of {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountingManagement;