import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { createTransaction } from '../../../utils/admin/finance.util';
import toast from 'react-hot-toast';

const NewEntry = ({ isOpen, onClose, accounts, onCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().slice(0,10),
    referenceNumber: '',
    transactionType: 'JOURNAL',
    category: '',
    description: '',
    fromAccount: '',
    toAccount: '',
    amount: '',
    currency: 'INR'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amount = Number(form.amount) || 0;

      // Build entries: simple adapter—debit to toAccount, credit from fromAccount
      const entries = [];
      if (form.fromAccount) entries.push({ accountId: form.fromAccount, credit: amount, debit: 0 });
      if (form.toAccount) entries.push({ accountId: form.toAccount, debit: amount, credit: 0 });

      const payload = {
        transactionDate: form.transactionDate,
        referenceNumber: form.referenceNumber,
        transactionType: form.transactionType,
        category: form.category,
        description: form.description,
        currency: form.currency,
        entries,
      };

      const res = await createTransaction(payload);
      if (res?.success) {
        toast.success('Transaction recorded');
        onCreated && onCreated(res.data);
      } else {
        toast.error(res?.message || 'Failed to create transaction');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Finance Entry</h2>
          <button onClick={onClose} className="p-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 dark:text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Date</label>
              <input type="date" value={form.transactionDate} onChange={(e)=>setForm({...form, transactionDate: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Reference #</label>
              <input value={form.referenceNumber} onChange={(e)=>setForm({...form, referenceNumber: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ref123" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select value={form.transactionType} onChange={(e)=>setForm({...form, transactionType: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option>JOURNAL</option>
                <option>PAYMENT</option>
                <option>RECEIPT</option>
                <option>TRANSFER</option>
                <option>ADJUSTMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <input value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Sales, Purchase, Salary" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">From Account (Credit)</label>
              <select value={form.fromAccount} onChange={(e)=>setForm({...form, fromAccount: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">— Select account —</option>
                {accounts?.map(a => <option key={a._id} value={a._id}>{a.name} {a.code ? `(${a.code})` : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">To Account (Debit)</label>
              <select value={form.toAccount} onChange={(e)=>setForm({...form, toAccount: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">— Select account —</option>
                {accounts?.map(a => <option key={a._id} value={a._id}>{a.name} {a.code ? `(${a.code})` : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Amount</label>
              <input type="number" value={form.amount} onChange={(e)=>setForm({...form, amount: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Currency</label>
              <input value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
              Create Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntry;
