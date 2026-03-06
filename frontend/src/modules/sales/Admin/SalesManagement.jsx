import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import AddInvoice from '../components/AddInvoice';
import ViewInvoice from '../components/ViewInvoice';
import { getSalesRecords, updateInvoiceStatus, deleteInvoice } from '../../../utils/admin/sales.util';
import { getAllLeads } from '../../../utils/admin/crm.util';
import toast from 'react-hot-toast';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const statusOptions = ['ALL', 'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getSalesRecords();
      if (result.success) {
        setSales(result.data || []);
      } else {
        toast.error(result.message || 'Failed to load sales records');
      }
      // fetch leads/customers for invoice creation
      try {
        const leadsRes = await getAllLeads();
        if (leadsRes?.success) setLeads(leadsRes.data || []);
      } catch (lErr) {
        console.warn('Failed to fetch leads for invoices', lErr);
      }
    } catch (err) {
      toast.error('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Mark this invoice as "${newStatus}"?`)) return;

    try {
      const result = await updateInvoiceStatus(id, newStatus);
      if (result.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
    setOpenMenuId(null);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

    try {
      const result = await deleteInvoice(id);
      if (result.success) {
        toast.success('Invoice deleted successfully');
        fetchData();
      } else {
        toast.error(result.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const getStatusBadge = (status) => {
    const base = 'inline-block px-3 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'PAID':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case 'SENT':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
      case 'PARTIALLY_PAID':
        return `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300`;
      case 'OVERDUE':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case 'CANCELLED':
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
      case 'DRAFT':
        return `${base} bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesStatus = filterStatus === 'ALL' || sale.status === filterStatus;
    const matchesSearch = JSON.stringify(sale).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {showAddModal && (
          <AddInvoice
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            leads={leads}
            onInvoiceCreated={() => {
              fetchData();
              setShowAddModal(false);
            }}
            mode="create"
          />
        )}

        {showEditModal && selectedInvoice && (
          <AddInvoice
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedInvoice(null);
            }}
            leads={leads}
            onInvoiceCreated={() => {
              fetchData();
              setShowEditModal(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
            mode="edit"
          />
        )}

        {showViewModal && selectedInvoice && (
          <ViewInvoice
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
            leads={leads}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <ShoppingCart className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Sales & Invoices
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Orders • Invoices • Payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border cursor-pointer border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className="flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              onClick={()=>setShowAddModal(true)}
            >
              <Plus size={18} />
              New Invoice
            </button>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="w-[90vw] md:w-[100%] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterStatus === status
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" size={18} />
            <input
              type="text"
              placeholder="Search orders, customers, invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:text-white dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className=" w-[90vw] md:w-[100%] bg-white dark:bg-gray-900 border  border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto dark:text-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-300">Order / Customer</th>
                <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-300">Invoice / Items</th>
                <th className="p-4 text-center font-medium text-gray-600 dark:text-gray-300">Amount</th>
                <th className="p-4 text-center font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-4 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    No matching records found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors overflow-auto">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {sale.orderNumber || '—'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {sale.customerId?.organizationName ||
                          sale.customerId?.contact?.name ||
                          sale.customerId?.name ||
                          '—'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.invoiceNumber ? `INV-${sale.invoiceNumber}` : 'Not Invoiced'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sale.items?.length || 0} item{sale.items?.length !== 1 ? 's' : ''}
                      </div>
                    </td>

                    <td className="p-4 text-center font-medium text-base">
                      ₹{(sale.grandTotal || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-center">
                      <span className={getStatusBadge(sale.status)}>
                        {sale.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === sale._id ? null : sale._id)}
                          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === sale._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                            <button
                              onClick={() => handleViewInvoice(sale)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
                            >
                              <FileText size={16} />
                              View Invoice
                            </button>
                            {sale.status !== 'PAID' && sale.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleEditInvoice(sale)}
                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
                              >
                                <Edit2 size={16} />
                                Edit Invoice
                              </button>
                            )}
                            {sale.status !== 'PAID' && sale.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleStatusUpdate(sale._id, 'PAID')}
                                className="w-full text-left px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
                              >
                                <CheckCircle2 size={16} />
                                Mark as Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInvoice(sale._id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete Invoice
                            </button>
                          </div>
                        )}
                      </div>
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

export default SalesManagement;