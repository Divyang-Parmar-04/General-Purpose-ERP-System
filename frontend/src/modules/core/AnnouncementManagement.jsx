import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Info,
    Megaphone,
    Plus,
    Trash2,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import {
    createAnnouncementAPI,
    getAnnouncementsAPI,
    deleteAnnouncementAPI
} from "../../utils/admin/announcement.util";

const AnnouncementManagement = () => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role?.name === "ADMIN" || user?.role?.name === "SUPER_ADMIN";

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "INFO",
        targetAudience: "ALL",
        expiryDate: ""
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const res = await getAnnouncementsAPI();
        if (res.success) {
            setAnnouncements(res.announcements);
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await createAnnouncementAPI(formData);
        if (res.success) {
            toast.success("Announcement created!");
            setShowModal(false);
            setFormData({ title: "", content: "", type: "INFO", targetAudience: "ALL", expiryDate: "" });
            fetchAnnouncements();
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        const res = await deleteAnnouncementAPI(id);
        if (res.success) {
            toast.success("Deleted successfully");
            fetchAnnouncements();
        } else {
            toast.error(res.message);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "URGENT": return <AlertCircle className="w-5 h-5 text-red-600" />;
            case "WARNING": return <Bell className="w-5 h-5 text-amber-600" />;
            case "SUCCESS": return <CheckCircle className="w-5 h-5 text-green-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case "URGENT": return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900";
            case "WARNING": return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900";
            case "SUCCESS": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900";
            default: return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900";
        }
    };

    return (
        <div className="md:p-8 min-h-screen bg-gray-50 dark:bg-gray-950 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-lg">
                            <Megaphone className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Announcements</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage and view company-wide updates.
                            </p>
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => {setShowModal(true)}}
                            className="flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                             Create Announcement
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-400 text-sm">Loading announcements...</p>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No active announcements</p>
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div
                                key={ann._id}
                                className={`relative p-4 md:p-6 rounded-xl bg-white dark:bg-gray-900 transition-all w-[90vw] md:w-[100%]`}
                            >
                                <div className="flex justify-between items-start gap-2 md:gap-4">
                                    <div className="flex gap-2 md:gap-4">
                                        <div className="mt-1">{getTypeIcon(ann.type)}</div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                                {ann.title}
                                            </h3>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {ann.content}
                                            </p>
                                            <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                <span>By {ann.createdBy?.name || "Admin"}</span>
                                                <span>•</span>
                                                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                                {ann.targetAudience !== "ALL" && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                                                            {ann.targetAudience}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(ann._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Post Announcement</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 dark:text-white space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Enter announcement title"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Content</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    placeholder="What do you want to announce?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                                    >
                                        <option value="INFO">Info</option>
                                        <option value="WARNING">Warning</option>
                                        <option value="URGENT">Urgent</option>
                                        <option value="SUCCESS">Success</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Audience</label>
                                    <select
                                        name="targetAudience"
                                        value={formData.targetAudience}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                                    >
                                        <option value="ALL">All Users</option>
                                        <option value="EMPLOYEES">Employees Only</option>
                                        <option value="ADMINS">Admins Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-gray-200 dark:border-gray-700 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    Post Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagement;
