import React, { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Plus,
  X,
  HardDrive,
} from "lucide-react";
import { getDocuments, uploadDocuments, deleteDocument } from "../../../utils/admin/document.util";
import toast from "react-hot-toast";

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [customCategory, setCustomCategory] = useState("");
  const [category, setCategory] = useState("");
  const [filteredDocs, setFilterDocs] = useState([]);

  const categories = ["INVOICE", "CONTRACT", "ID_PROOF", "REPORT", "OTHER"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getDocuments();
      if (result.success) {
        setDocuments(result.data || []);
        setFilterDocs(result.data || []);
      } else {
        toast.error(result.message || "Failed to load documents");
      }
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = e.target.files.files;
    if (!files || files.length === 0) return toast.error("Please select at least one file");

    let category = e.target.category.value;
    if (category === "OTHER") {
      category = customCategory.trim().toUpperCase().replace(/\s+/g, "_");
      if (!category) return toast.error("Please enter a custom category name");
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }
    formData.append("category", category);

    try {
      setIsUploading(true);
      const result = await uploadDocuments(formData);
      if (result.success) {
        toast.success("Files uploaded successfully");
        setShowUploadModal(false);
        setCustomCategory("");
        fetchData();
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const UpdateCategory = (e) => {
    const category = e.target.value;
    setCategory(category);
    if (category === "OTHER") {
      setCustomCategory("");
    }
  };

  const handleFilter = (category) => {

    if (category === "OTHER") {
      setFilterDocs(documents.filter((d) => d.documentType !== "INVOICE" && d.documentType !== "CONTRACT" && d.documentType !== "ID_PROOF" && d.documentType !== "REPORT"));
    }
    else {
      const filteredDocs =
        category === "ALL"
          ? documents
          : documents.filter((d) => d.documentType === category);
      setFilterDocs(filteredDocs);
    }

  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <HardDrive className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Document Vault
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Files • Records • Digital Assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              Upload Files
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 overflow-x-auto w-[90vw] md:w-[100%]">
          <button
            onClick={() => handleFilter("ALL")}
            className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${selectedCategory === "ALL"
              ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
          >
            All Documents
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${selectedCategory === cat
                ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Documents Table */}
        <div className="bg-white w-[90vw] md:w-[100%] dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">File / ID</th>
                <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Category</th>
                <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Size</th>
                <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Uploaded</th>
                <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No documents found in this category
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <FileText size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.title || doc.file?.name || "Untitled"}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ID: {doc._id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{doc.documentType || "OTHER"}</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {formatSize(doc.file?.size)}
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={doc.file?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View / Download"
                        >
                          <Eye size={18} />
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Delete"
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Upload Documents
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-6 dark:text-white  ">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    onChange={(e) => UpdateCategory(e)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="INVOICE"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {category === "OTHER" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      name="other"
                      placeholder="e.g. BOARD_MEETING_NOTES"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                      onChange={(e) => setCustomCategory(e.target.value.trim().toUpperCase().replace(/\s+/g, "_"))}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Files
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="text-gray-400 mb-3" size={32} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to select or drag files here
                    </span>
                    <span className="text-xs text-gray-500 mt-1">(PDF, images, docs – max 10MB per file recommended)</span>
                    <input
                      type="file"
                      name="files"
                      multiple
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                    />
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-3 bg-gray-800 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isUploading && <RefreshCw className="animate-spin" size={18} />}
                    Upload Files
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

export default DocumentManagement;