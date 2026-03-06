import React, { useEffect, useState } from 'react';
import {
  Wallet,
  RefreshCw,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { getAccounts, getTransactions, deleteAccount } from '../../../utils/admin/finance.util';
import NewEntry from '../components/NewEntry';
import AddAccount from '../components/AddAccount';
import toast from 'react-hot-toast';

const FinanceManagement = () => {
  const [activeTab, setActiveTab] = useState('TRANSACTIONS');
  const [data, setData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = activeTab === 'TRANSACTIONS'
        ? await getTransactions()
        : await getAccounts();

      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || `Failed to load ${activeTab.toLowerCase()}`);
      }
    } catch (err) {
      toast.error('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      if (res?.success) setAccounts(res.data || []);
    } catch (err) {
      console.warn('Failed to load accounts', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAccounts();
  }, [activeTab]);

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account? Action cannot be undone.")) return;
    try {
      const res = await deleteAccount(id);
      if (res.success) {
        toast.success("Account deleted");
        fetchData();
        fetchAccounts();
      } else {
        toast.error(res.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Error deleting account");
    }
  };

  const filteredData = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Wallet className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Finance
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Accounts • Transactions • Ledger
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
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors "
              onClick={() => activeTab === 'TRANSACTIONS' ? setShowNewEntry(true) : setShowAddAccount(true)}
            >
              <Plus size={18} />
              {activeTab === 'TRANSACTIONS' ? 'New Entry' : 'Add Account'}
            </button>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {['TRANSACTIONS', 'ACCOUNTS'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                  ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {showNewEntry && (
            <NewEntry
              isOpen={showNewEntry}
              onClose={() => setShowNewEntry(false)}
              accounts={accounts}
              onCreated={() => { fetchData(); setShowNewEntry(false); }}
            />
          )}

          {showAddAccount && (
            <AddAccount
              isOpen={showAddAccount}
              onClose={() => setShowAddAccount(false)}
              onCreated={() => { fetchData(); fetchAccounts(); setShowAddAccount(false); }}
            />
          )}

          {activeTab === 'TRANSACTIONS' ? (
            <div className="overflow-x-auto w-[90vw] md:w-[100%]">
              <table className="w-full text-sm dark:text-white">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-center">Amount</th>
                    <th className="p-4 text-center">Ref #</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={6} className="py-16 text-center text-gray-500">Loading transactions...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center text-gray-500">No transactions found</td></tr>
                  ) : (
                    filteredData.map(tx => {
                      const totalDebit = tx.entries?.reduce((s, e) => s + (e.debit || 0), 0) || 0;
                      const totalCredit = tx.entries?.reduce((s, e) => s + (e.credit || 0), 0) || 0;
                      const netAmount = totalCredit - totalDebit;
                      const isPositive = netAmount >= 0;

                      return (
                        <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="p-4 font-medium text-gray-700 dark:text-gray-300">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs">
                              {tx.category || tx.transactionType || '—'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={tx.description}>{tx.description || '—'}</td>
                          <td className="p-4 text-center font-bold">
                            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                              {netAmount !== 0 ? (isPositive ? '+' : '') + '₹' + Math.abs(netAmount).toLocaleString('en-IN') : '—'}
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-500 text-xs font-mono">{tx.referenceNumber || '—'}</td>
                          <td className="p-4 text-right">
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tx.status === 'COMPLETED'
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                              : tx.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900'
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                              }`}>
                              {tx.status || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto w-[90vw] md:w-[100%]">
              <table className="w-full text-sm dark:text-white">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4 text-left">Account Info</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-right">Balance</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={5} className="py-16 text-center text-gray-500">Loading accounts...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-gray-500">No accounts found</td></tr>
                  ) : (
                    filteredData.map(acc => (
                      <tr key={acc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{acc.name}</div>
                          {acc.code && <div className="text-xs font-mono text-gray-500 mt-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 inline-block rounded">{acc.code}</div>}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{acc.type}</div>
                          {acc.subType && <div className="text-xs text-gray-500">{acc.subType}</div>}
                        </td>
                        <td className="p-4 text-right font-medium">
                          <div className={acc.openingBalance?.amount >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}>
                            ₹{(acc.openingBalance?.amount || 0).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{acc.openingBalance?.type || 'DR'}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{acc.status}</span>
                        </td>
                        <td className="p-4 text-center">
                          {/* Prevent deleting system accounts if flagged, assuming default is safe or users know what they do */}
                          {!acc.isSystemAccount && (
                            <button
                              onClick={() => handleDeleteAccount(acc._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;