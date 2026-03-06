import React, { useEffect, useState } from 'react';
import {
  Folder,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { getAllProjects, createProject, updateProject, deleteProject } from '../../../utils/admin/project.util';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    budget: { estimated: 0, currency: 'INR' },
  });

  const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await getAllProjects();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        toast.error(result.message || 'Failed to load projects');
      }
    } catch (err) {
      toast.error('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      startDate: '',
      endDate: '',
      budget: { estimated: 0, currency: 'INR' },
    });
    setSelectedProject(null);
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editMode) {
        await updateProject(selectedProject._id, formData);
        toast.success('Project updated');
      } else {
        await createProject(formData);
        toast.success('Project created');
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status || 'NOT_STARTED',
      priority: project.priority || 'MEDIUM',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: {
        estimated: project.budget?.estimated || 0,
        currency: project.budget?.currency || 'INR',
      },
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    const base = 'inline-block px-3 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'COMPLETED':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case 'IN_PROGRESS':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
      case 'ON_HOLD':
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      case 'CANCELLED':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  const getPriorityBadge = (priority) => {
    const base = 'inline-block px-2.5 py-0.5 text-xs font-medium rounded';
    switch (priority) {
      case 'CRITICAL':
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Folder className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Projects
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active initiatives & deliverables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProjects}
              className="p-2.5 border border-gray-300 cursor-pointer dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
        </div>

        {/* Search & Filter (placeholder - can be enhanced later) */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 " size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-11 pr-4 py-2.5 border dark:text-white border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            />
          </div>
          <select className="px-4 py-2.5 border dark:text-white border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500">
            <option>All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={getStatusBadge(project.status)}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-1.5 cursor-pointer text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {project.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      <span>
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString('en-IN')
                          : 'Not set'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={16} />
                      <span className={getPriorityBadge(project.priority)}>
                        {project.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User size={16} />
                      <span>
                        {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    Budget: ₹{(project.budget?.estimated || 0).toLocaleString('en-IN')}
                  </div>
                  {project.endDate && (
                    <div className="text-gray-500 text-xs">
                      Due: {new Date(project.endDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 dark:text-white">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editMode ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Project goals, scope, objectives..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                          {s.replace('_', ' ')}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Estimated Budget (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.budget.estimated}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, estimated: Number(e.target.value) },
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    {editMode ? 'Update Project' : 'Create Project'}
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

export default Projects;