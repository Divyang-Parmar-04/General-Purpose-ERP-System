import React, { useEffect, useState } from "react";
import {
    FileText,
    Download,
    Search,
    Filter,
    FolderOpen,
    File,
    RefreshCw,
    Eye,
    Calendar,
    User,
} from "lucide-react";
import {
    getBusinessDocuments,
    getFolders,
    getDocumentTypes,
} from "../../../utils/employee/document.util";
import toast from "react-hot-toast";

const EmployeeDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    // Filters
    const [selectedFolder, setSelectedFolder] = useState("ALL");
    const [selectedType, setSelectedType] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [selectedFolder, selectedType, searchQuery]);

    const fetchInitialData = async () => {
        try {
            const [foldersRes, typesRes] = await Promise.all([
                getFolders(),
                getDocumentTypes(),
            ]);

            if (foldersRes.success) setFolders(foldersRes.data);
            if (typesRes.success) setDocumentTypes(typesRes.data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (selectedFolder !== "ALL") filters.folder = selectedFolder;
            if (selectedType !== "ALL") filters.documentType = selectedType;
            if (searchQuery) filters.search = searchQuery;

            const result = await getBusinessDocuments(filters);
            if (result.success) {
                setDocuments(result.data);
            } else {
                toast.error("Failed to load documents");
            }
        } catch (error) {
            toast.error("Error loading documents");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (document) => {
        window.open(document.file.url, "_blank");
    };

    const getFileIcon = (fileType) => {
        const type = fileType?.toLowerCase();
        if (type?.includes("pdf")) return "📄";
        if (type?.includes("doc")) return "📝";
        if (type?.includes("xls") || type?.includes("sheet")) return "📊";
        if (type?.includes("image") || type?.includes("png") || type?.includes("jpg")) return "🖼️";
        return "📎";
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "N/A";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-lg">
                            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Documents
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Access business documents and files
                            </p>
                        </div>
                    </div>
                    <div>

                        <button
                            onClick={fetchDocuments}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Refresh documents"
                        >
                            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 w-[90vw] md:w-[100%]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Folder Filter */}
                        <div className="relative">
                            <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedFolder}
                                onChange={(e) => setSelectedFolder(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="ALL">All Folders</option>
                                {folders.map((folder) => (
                                    <option key={folder} value={folder}>
                                        {folder}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="ALL">All Types</option>
                                {documentTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-gray-500">
                            Loading documents...
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="py-16 text-center">
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No documents found
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                                        <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Document
                                        </th>
                                        <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Type
                                        </th>
                                        <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Folder
                                        </th>
                                        <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                                            Uploaded By
                                        </th>
                                        <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                                            Size
                                        </th>
                                        <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                                            Date
                                        </th>
                                        <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {documents.map((doc) => (
                                        <tr
                                            key={doc._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {getFileIcon(doc.file.type)}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {doc.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {doc.file.type?.toUpperCase() || "FILE"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                                                    {doc.documentType || "General"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <FolderOpen size={14} />
                                                    <span>{doc.folder || "ROOT"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {doc.uploadedBy?.name || "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                                                {formatFileSize(doc.file.size)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(doc.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownload(doc)}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                                                        title="Download"
                                                    >
                                                        <Download
                                                            size={16}
                                                            className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(doc.file.url, "_blank")}
                                                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                                                        title="View"
                                                    >
                                                        <Eye
                                                            size={16}
                                                            className="text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Stats Footer */}
                {!loading && documents.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Total Size:{" "}
                                {formatFileSize(
                                    documents.reduce((sum, doc) => sum + (doc.file.size || 0), 0)
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDocuments;
