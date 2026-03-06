import React, { useEffect, useState } from "react";
import {
  getAllDepartmentsAPI,
  createDepartmentAPI,
  updateDepartmentAPI,
  deleteDepartmentAPI,
} from "../../../../utils/admin/department.util";
import { getAllEmployeesAPI } from "../../../../utils/admin/user.util";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, X, Edit2, Trash2, Users, Briefcase, Layers } from "lucide-react";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        getAllDepartmentsAPI(),
        getAllEmployeesAPI(),
      ]);
      setDepartments(deptRes?.data || deptRes || []);
      setEmployees(empRes?.data || empRes || []);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", managerId: "" });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createDepartmentAPI(form);
      if (res.success) {
        toast.success("Department created");
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        toast.error(res.message || "Failed to create department");
      }
    } catch (err) {
      toast.error("Creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: selectedDept.name,
        description: selectedDept.description || "",
        managerId: selectedDept.managerId?._id || selectedDept.managerId || "",
        status: selectedDept.status,
      };
      const res = await updateDepartmentAPI(selectedDept._id, payload);
      if (res.success) {
        toast.success("Department updated");
        setShowEditModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department? This action cannot be undone.")) return;
    try {
      const res = await deleteDepartmentAPI(id);
      if (res.success) {
        toast.success("Department deleted");
        fetchData();
      } else {
        toast.error(res.message || "Delete restricted");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openEdit = (dept) => {
    setSelectedDept({ ...dept });
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
    if (status === "ACTIVE")
      return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
    return `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950  md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Layers className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Departments
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organization structure & teams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 cursor-pointer dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-5 cursor-pointer py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No departments found. Add your first department to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-colors flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={getStatusBadge(dept.status || "ACTIVE")}>
                      {dept.status || "ACTIVE"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(dept)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Edit department"
                      >
                        <Edit2 size={18} />
                      </button>

                      {(!dept.totalEmployees || dept.totalEmployees === 0) && (
                        <button
                          onClick={() => handleDelete(dept._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Delete department"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {dept.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                    {dept.description || "No description provided"}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users size={16} />
                      <span>
                        {dept.totalEmployees || 0} member{dept.totalEmployees !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase size={16} />
                      <span>
                        Manager:{" "}
                        {dept.managerId?.name || (
                          <span className="italic text-gray-500">Not assigned</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Department Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 dark:text-white">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Add New Department
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Department Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Sales & Marketing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Purpose and scope of this department..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Department Manager
                  </label>
                  <select
                    value={form.managerId}
                    onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">No Manager ( can assign later )</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditModal && selectedDept && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto dark:text-white">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Department
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 cursor-pointer dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Department Name
                  </label>
                  <input
                    required
                    value={selectedDept.name}
                    onChange={(e) => setSelectedDept({ ...selectedDept, name: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedDept.status || "ACTIVE"}
                    onChange={(e) => setSelectedDept({ ...selectedDept, status: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                    Department Manager
                  </label>
                  <select
                    value={selectedDept.managerId?._id || selectedDept.managerId || ""}
                    onChange={(e) => setSelectedDept({ ...selectedDept, managerId: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">— No Manager —</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Department;