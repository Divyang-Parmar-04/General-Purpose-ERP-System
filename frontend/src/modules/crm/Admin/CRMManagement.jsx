import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  RefreshCw,
  Search,
  MoreVertical,
  Phone,
  Mail,
  User,
  Calendar,
  Edit2,
  Trash2,
  X,
  ChevronDown,
} from 'lucide-react';
import { getAllLeads, createLead, updateLead, deleteLead } from '../../../utils/admin/crm.util';
import { getAllEmployeesAPI } from '../../../utils/admin/user.util';
import toast from 'react-hot-toast';

const CRMManagement = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: { name: '', email: '', phone: '', designation: '' },
    source: '',
    status: 'NEW',
    priority: 'MEDIUM',
    assignedTo: '',
    estimatedValue: { amount: 0, currency: 'INR' },
  });
  

  const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, empsRes] = await Promise.all([getAllLeads(), getAllEmployeesAPI()]);
      if (leadsRes.success) setLeads(leadsRes.data || []);
      setEmployees(empsRes?.data || empsRes || []);
    } catch (error) {
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: { name: '', email: '', phone: '', designation: '' },
      source: '',
      status: 'NEW',
      priority: 'MEDIUM',
      assignedTo: '',
      estimatedValue: { amount: 0, currency: 'INR' },
    });
    setSelectedLead(null);
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        organizationName: formData.companyName,
        contact: formData.contactPerson,
        source: formData.source,
        pipelineStage: formData.status,
        status: formData.status === 'WON' ? 'WON' : formData.status === 'LOST' ? 'LOST' : 'OPEN',
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        deal: { value: formData.estimatedValue.amount || 0, currency: formData.estimatedValue.currency || 'INR' },
      };
      if (editMode) {
        await updateLead(selectedLead._id, payload);
        toast.success('Lead updated');
      } else {
        await createLead(payload);
        toast.success('Lead created');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await deleteLead(id);
      toast.success('Lead deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      companyName: lead.organizationName || '',
      contactPerson: lead.contact || { name: '', email: '', phone: '', designation: '' },
      source: lead.source || '',
      status: lead.pipelineStage || 'NEW',
      priority: lead.priority || 'MEDIUM',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      estimatedValue: { amount: lead.deal?.value || 0, currency: lead.deal?.currency || 'INR' },
    });
    setEditMode(true);
    setShowModal(true);
  };

  const filteredLeads = filterStatus === 'ALL' ? leads : leads.filter((l) => l.pipelineStage === filterStatus);

  const getStatusBadge = (status) => {
    const base = 'inline-block px-3 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'WON':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case 'LOST':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case 'NEW':
      case 'CONTACTED':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
      case 'QUALIFIED':
      case 'PROPOSAL':
      case 'NEGOTIATION':
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  const getPriorityBadge = (priority) => {
    const base = 'inline-block px-2.5 py-0.5 text-xs font-medium rounded';
    switch (priority) {
      case 'URGENT':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      case 'HIGH':
        return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300`;
      case 'MEDIUM':
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      default:
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Target className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">CRM - Leads</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pipeline • Prospects • Opportunities
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
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Lead
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto w-[90vw] md:w-[100%]">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All Leads
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Company / Status</th>
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Contact Person</th>
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Value / Source</th>
                <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Assigned To</th>
                <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {lead.organizationName || '—'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={getStatusBadge(lead.pipelineStage)}>
                          {lead.pipelineStage || 'NEW'}
                        </span>
                        <span className={getPriorityBadge(lead.priority)}>
                          {lead.priority || 'MEDIUM'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium">{lead.contact?.name || '—'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <Mail size={14} />
                        {lead.contact?.email || '—'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium">
                        ₹{(lead.deal?.value || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Source: {lead.source || 'Direct'}
                      </div>
                    </td>

                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {lead.assignedTo?.name || 'Unassigned'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(lead)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Edit lead"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit Lead Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editMode ? 'Edit Lead' : 'Create New Lead'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 dark:text-white rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 dark:text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Company / Entity Name
                    </label>
                    <input
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Contact Person Name
                    </label>
                    <input
                      value={formData.contactPerson.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, name: e.target.value },
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, email: e.target.value },
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      value={formData.contactPerson.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, phone: e.target.value },
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Designation
                    </label>
                    <input
                      value={formData.contactPerson.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, designation: e.target.value },
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Procurement Head"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Lead Source
                    </label>
                    <input
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Website, Referral, Cold Call"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Estimated Value (INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.estimatedValue.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedValue: { ...formData.estimatedValue, amount: Number(e.target.value) },
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                    {editMode ? 'Update Lead' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMManagement;