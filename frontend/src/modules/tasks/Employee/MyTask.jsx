import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
    getMyTasksAPI,
    createTaskAPI,
    updateMyTaskAPI,
} from "../../../utils/employee/myTask.util";
import {
    Upload,
    X,
    FileText,
    RefreshCw,
    Plus,
    ClipboardList,
    Edit,
} from "lucide-react";

function MyTasks() {

    const user = useSelector((state) => state.auth.user);
    const canCreateTask = user?.role?.permissions?.includes("create_task") || false;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [uploadFiles, setUploadFiles] = useState([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    // Create task form
    const [createForm, setCreateForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        assignedTo: [],
        dueDate: "",
        assignmentType: "USER",
        departmentId: "",
        documents: [],
        status: ""
    });

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            const res = await getMyTasksAPI();
            setTasks(res.data || []);
        } catch (err) {
            toast.error(err.message || "Failed to load your tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const resetCreateForm = () => {
        setCreateForm({
            title: "",
            description: "",
            priority: "MEDIUM",
            assignedTo: [],
            dueDate: "",
            assignmentType: "USER",
            departmentId: "",
            documents: [],
        });
    };

    // Open upload modal for a specific task
    const openUploadModal = (taskId) => {
        setSelectedTaskId(taskId);
        setUploadFiles([]);
        setShowUploadModal(true);
    };

    // Submit new documents to selected task
    const handleUploadDocuments = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) {
            toast.error("Please select at least one file");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        uploadFiles.forEach((file) => formData.append("documents", file));

        try {
            await updateMyTaskAPI(selectedTaskId, formData);
            toast.success("Document(s) uploaded successfully");
            setShowUploadModal(false);
            setUploadFiles([]);
            fetchMyTasks();
        } catch (err) {
            toast.error(err.message || "Failed to upload documents");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Change task status
    const handleStatusChange = async (taskId, newStatus) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("status", newStatus);

        // console.log(formData)

        try {
            await updateMyTaskAPI(taskId, formData);
            toast.success("Status updated");
            fetchMyTasks();
        } catch (err) {
            toast.error(err.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Create new task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("title", createForm.title.trim());
        formData.append("description", createForm.description || "");
        formData.append("priority", createForm.priority);
        formData.append("dueDate", createForm.dueDate || "");
        formData.append("assignmentType", createForm.assignmentType);

        if (createForm.assignmentType === "DEPARTMENT") {
            formData.append("departmentId", createForm.departmentId.trim());
        } else {
            createForm.assignedTo.forEach((id) => {
                if (id.trim()) formData.append("assignedTo", id.trim());
            });
        }

        createForm.documents.forEach((file) => formData.append("documents", file));

        try {
            await createTaskAPI(formData);
            toast.success("Task created successfully");
            setShowCreateForm(false);
            resetCreateForm();
            fetchMyTasks();
        } catch (err) {
            toast.error(err.message || "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Frontend filtering
    const filteredTasks = tasks.filter((task) => {
        const matchStatus = statusFilter === "ALL" || task.status === statusFilter;
        const matchType = typeFilter === "ALL" || task.assignmentType === typeFilter;
        return matchStatus && matchType;
    });

    // const getStatusBadge = (status) => {
    //     const base = "inline-block px-3 py-1 text-xs font-medium rounded-full border";
    //     switch (status) {
    //         case "COMPLETED":
    //             return `${base} bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300`;
    //         case "IN_PROGRESS":
    //             return `${base} bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300`;
    //         case "PENDING":
    //             return `${base} bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300`;
    //         default:
    //             return `${base} bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300`;
    //     }
    // };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 bg-blue-600/10 rounded-lg">
                            <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">My Tasks</h1>
                            <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                All tasks assigned to you
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchMyTasks}
                            className="p-2 sm:p-2.5 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Refresh"
                            disabled={loading || isSubmitting}
                        >
                            <RefreshCw size={18} className={loading || isSubmitting ? "animate-spin" : ""} />
                        </button>

                        {canCreateTask && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                <Plus size={18} />
                                <span className="hidden xs:inline">Create Task</span>
                                <span className="xs:hidden">Create</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-white dark:text-gray-300 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-white dark:text-gray-300 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="ALL">All Types</option>
                            <option value="USER">Individual</option>
                            <option value="DEPARTMENT">Department</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Table wrapper */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto shadow-sm w-[90vw] md:w-[100%] scrollbar-thin">
                    <div className="">
                        <table className="w-auto text-sm text-left min-w-0 sm:min-w-[100%]">
                            {/* allow width to be determined by content; scrollbar appears when content exceeds container */}
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b whitespace-nowrap">
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300">Task</th>
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300">Assigned By</th>
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Priority</th>
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Status</th>
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Due Date</th>
                                    <th className="p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 ">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            Loading your tasks...
                                        </td>
                                    </tr>
                                ) : filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            No tasks match the selected filters
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ">
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
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                                                    {task.assignedBy?.name || "—"}
                                                </div>
                                                {task.assignmentType === "DEPARTMENT" && task.departmentId?.name && (
                                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                                        Dept: {task.departmentId.name}
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

                                            <td className="p-2 sm:p-4 text-center">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                    disabled={isSubmitting}
                                                    className={`inline-block px-2 sm:px-4 py-1 text-xs sm:text-sm dark:text-gray-300 dark:bg-gray-800 bg-gray-200 font-medium rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px] sm:min-w-[140px] tracking-tight`}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="COMPLETED">Completed</option>
                                                </select>
                                            </td>

                                            <td className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                                            </td>

                                            <td className="p-3 sm:p-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => openUploadModal(task._id)}
                                                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        title="Upload Document"
                                                        disabled={isSubmitting}
                                                    >
                                                        <Upload size={18} className="text-blue-600" />
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
            </div>
            {/* Upload Document Modal */}
            {
                showUploadModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-2xl">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Upload Documents
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFiles([]);
                                        setSelectedTaskId(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                >
                                    <X size={24} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Select files to upload
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                        <Upload className="text-gray-400 mb-3" size={36} />
                                        <span className="text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                                            {uploadFiles.length > 0
                                                ? `${uploadFiles.length} file(s) selected`
                                                : "Click or drag files here\nAny file type supported"}
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                                            className="hidden"
                                        />
                                    </label>

                                    {uploadFiles.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Selected files:
                                            </p>
                                            <ul className="space-y-2 max-h-32 overflow-y-auto">
                                                {uploadFiles.map((file, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded"
                                                    >
                                                        <FileText size={16} />
                                                        <span className="truncate flex-1">{file.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t flex gap-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFiles([]);
                                        setSelectedTaskId(null);
                                    }}
                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadDocuments}
                                    disabled={isSubmitting || uploadFiles.length === 0}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                                    Upload {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ""}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Task Modal */}
            {
                showCreateForm && canCreateTask && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <form
                            onSubmit={handleCreateTask}
                            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {isSubmitting && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-xl">
                                    <RefreshCw className="w-12 h-12 animate-spin text-white" />
                                </div>
                            )}

                            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-xl">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Create New Task
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetCreateForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800"
                                        placeholder="Enter task title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none dark:bg-gray-800"
                                        placeholder="Provide details about the task..."
                                    />
                                </div>

                                {/* Priority & Due Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={createForm.priority}
                                            onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={createForm.dueDate}
                                            onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800"
                                        />
                                    </div>
                                </div>

                                {/* Assignment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assign To
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCreateForm({
                                                    ...createForm,
                                                    assignmentType: "USER",
                                                    departmentId: "",
                                                    assignedTo: [],
                                                })
                                            }
                                            className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${createForm.assignmentType === "USER"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            Individual
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCreateForm({
                                                    ...createForm,
                                                    assignmentType: "DEPARTMENT",
                                                    assignedTo: [],
                                                })
                                            }
                                            className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${createForm.assignmentType === "DEPARTMENT"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            Department
                                        </button>
                                    </div>
                                </div>

                                {/* Assignee / Department Selection */}
                                {createForm.assignmentType === "USER" ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Employee IDs (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 64f8a123abc, 64f8a456def"
                                            value={createForm.assignedTo.join(", ")}
                                            onChange={(e) =>
                                                setCreateForm({
                                                    ...createForm,
                                                    assignedTo: e.target.value.split(",").map((id) => id.trim()),
                                                })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Department ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter department ID"
                                            value={createForm.departmentId}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, departmentId: e.target.value.trim() })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800"
                                        />
                                    </div>
                                )}

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Attachments
                                    </label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                        <Upload className="text-gray-400 mb-2" size={28} />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {createForm.documents.length > 0
                                                ? `${createForm.documents.length} file(s) selected`
                                                : "Click or drag files here (any type)"}
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, documents: Array.from(e.target.files) })
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 border-t flex gap-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetCreateForm();
                                    }}
                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }

        </div >
    );
}

export default MyTasks;