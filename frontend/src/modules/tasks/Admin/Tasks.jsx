import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
} from "../../../utils/admin/task.util";
import { getAllDepartmentsAPI } from "../../../utils/admin/department.util";
import { getAllEmployeesAPI } from "../../../utils/admin/user.util";
import {
  Upload,
  X,
  FileText,
  Trash2,
  RefreshCw,
  Plus,
  ClipboardList,
} from "lucide-react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedTo: [],
    dueDate: "",
    assignmentType: "USER",
    departmentId: "",
    documents: [],
    existingDocuments: [],
    deleteDocuments: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, empsRes, deptsRes] = await Promise.all([
        getAllTasksAPI(),
        getAllEmployeesAPI(),
        getAllDepartmentsAPI(),
      ]);
      setTasks(tasksRes || []);
      setEmployees(empsRes?.data || empsRes || []);
      setDepartments(deptsRes?.data || deptsRes || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      assignedTo: [],
      dueDate: "",
      assignmentType: "USER",
      departmentId: "",
      documents: [],
      existingDocuments: [],
      deleteDocuments: [],
    });
    setEditingTask(null);
  };

  const handleFileChange = (e) => {
    setForm({ ...form, documents: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("priority", form.priority);
    formData.append("dueDate", form.dueDate);
    formData.append("assignmentType", form.assignmentType);

    if (form.assignmentType === "DEPARTMENT") {
      formData.append("departmentId", form.departmentId);
    } else {
      form.assignedTo.forEach((id) => formData.append("assignedTo", id));
    }

    form.documents.forEach((file) => formData.append("documents", file));

    if (editingTask) {
      form.deleteDocuments.forEach((url) => formData.append("deleteDocuments", url));
      formData.append("status", editingTask.status);
    }

    try {
      if (editingTask) {
        await updateTaskAPI(editingTask._id, formData);
        toast.success("Task updated");
      } else {
        await createTaskAPI(formData);
        toast.success("Task created");
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      assignedTo: task.assignedTo?._id ? [task.assignedTo._id] : task.assignedTo || [],
      dueDate: task.dueDate?.slice(0, 10) || "",
      assignmentType: task.assignmentType || "USER",
      departmentId: task.departmentId?._id || task.departmentId || "",
      documents: [],
      existingDocuments: task.documents || [],
      deleteDocuments: [],
    });
    setShowForm(true);
  };

  const toggleDeleteDocument = (url) => {
    setForm((prev) => ({
      ...prev,
      deleteDocuments: prev.deleteDocuments.includes(url)
        ? prev.deleteDocuments.filter((u) => u !== url)
        : [...prev.deleteDocuments, url],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      await deleteTaskAPI(id);
      toast.success("Task deleted");
      fetchData();
    } catch (error) {
      toast.error("Only completed tasks can be deleted");
    }
  };

  const toggleAssignee = (id) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter((i) => i !== id)
        : [...prev.assignedTo, id],
    }));
  };

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const getStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "COMPLETED":
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`;
      case "IN_PROGRESS":
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`;
      case "PENDING":
        return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-blue-600/10 rounded-lg">
              <ClipboardList className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
              <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Assignments & workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border dark:text-white cursor-pointer border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center cursor-pointer gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span className="hidden xs:inline">Create Task</span>
              <span className="xs:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto max-w-full">
          {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === s
                ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Tasks Table wrapper */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto shadow-sm w-[90vw] md:w-[100%] scrollbar-thin">
          <div className="">
            <table className="w-full text-sm text-left min-w-0 sm:min-w-[700px]">

              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b whitespace-nowrap">
                  <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300">Task</th>
                  <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300">Assigned To</th>
                  <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Priority</th>
                  <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Status</th>
                  <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2 sm:p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{task.title}</div>
                        <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 max-w-[140px] sm:max-w-md break-words">
                          {task.description || "No description"}
                        </p>
                        {task.documents?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {task.documents.map((doc, idx) => (
                              <a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                <FileText size={14} />
                                <span className="max-w-[100px] truncate">{doc.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-2 sm:p-4">
                        <div className="font-medium dark:text-white text-sm sm:text-base">
                          {task.assignedTo?.name || (task.departmentId?.name ? `${task.departmentId.name} (Dept)` : "Unassigned")}
                        </div>
                        {task.dueDate && (
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-2 sm:p-4 text-center">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 text-[8px] sm:text-xs font-medium rounded-full ${task.priority === "HIGH"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="p-3 sm:p-4 text-center">
                        <span className={`${getStatusBadge(task.status)} !px-2 sm:!px-3 !py-1 !text-[10px] sm:!text-xs`}>
                          {task.status?.replace("_", " ") || "—"}
                        </span>
                      </td>

                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 sm:p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1 sm:p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Task Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 dark:text-white">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
            >
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-3 text-gray-600 dark:text-gray-300">Saving task...</p>
                  </div>
                </div>
              )}

              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      required
                      disabled={isUploading}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Task title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      disabled={isUploading}
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Detailed description..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      disabled={isUploading}
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      disabled={isUploading}
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Assignment Type */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assignmentType: "USER", departmentId: "", assignedTo: [] })}
                      className={`flex-1 py-3 cursor-pointer px-4 rounded-lg border font-medium transition-all ${form.assignmentType === "USER"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, assignmentType: "DEPARTMENT", assignedTo: [] })}
                      className={`flex-1 cursor-pointer py-3 px-4 rounded-lg border font-medium transition-all ${form.assignmentType === "DEPARTMENT"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      Department
                    </button>
                  </div>
                </div>

                {/* Assignee / Department Selection */}
                {form.assignmentType === "USER" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-2">
                      Assign To
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg border-gray-200 dark:border-gray-700">
                      {employees.map((emp) => (
                        <button
                          key={emp._id}
                          type="button"
                          onClick={() => toggleAssignee(emp._id)}
                          className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${form.assignedTo.includes(emp._id)
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                          {emp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <select
                      disabled={isUploading}
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-300 mb-2">
                    Attachments
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="text-gray-400 mb-2" size={28} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {form.documents.length > 0
                        ? `${form.documents.length} file(s) selected`
                        : "Click or drag files here (PDF, DOC, DOCX)"}
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                </div>

                {/* Existing Documents (Edit mode) */}
                {editingTask && form.existingDocuments?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Existing Attachments
                    </label>
                    <div className="space-y-2">
                      {form.existingDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-gray-500" />
                            <span
                              className={`text-sm ${form.deleteDocuments.includes(doc.url) ? "line-through text-gray-400" : ""
                                }`}
                            >
                              {doc.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDeleteDocument(doc.url)}
                            className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${form.deleteDocuments.includes(doc.url) ? "text-blue-600" : "text-red-500 hover:text-red-700"
                              }`}
                          >
                            {form.deleteDocuments.includes(doc.url) ? (
                              <RefreshCw size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex gap-4 border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isUploading && <RefreshCw className="animate-spin" size={18} />}
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;