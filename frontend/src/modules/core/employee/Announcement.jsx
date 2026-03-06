import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    Megaphone,
    Calendar,
    User,
    Clock,
    RefreshCw,
    Search,
    Filter,
    ChevronRight,
} from "lucide-react";
import { getEmployeeAnnouncementsAPI } from "../../../utils/employee/announcement.util";

const Announcement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await getEmployeeAnnouncementsAPI();
            if (res.success) {

                setAnnouncements(res.announcements || []);

            } else {
                toast.error(res.message || "Failed to load announcements");
            }
        } catch (err) {
            toast.error(err.message || "Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter((ann) => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ann.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || ann.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeStyles = (type) => {
        switch (type) {
            case "URGENT":
                return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
            case "WARNING":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
            case "SUCCESS":
                return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-lg">
                            <Megaphone className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Company Announcements
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Stay updated with the latest news, updates and alerts
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAnnouncements}
                            disabled={loading}
                            className="flex dark:text-white items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        >
                            <option value="ALL">All Types</option>
                            <option value="INFO">Information</option>
                            <option value="URGENT">Urgent</option>
                            <option value="WARNING">Warning</option>
                            <option value="SUCCESS">Success</option>
                        </select>
                    </div>
                </div>

                {/* Announcements List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 animate-pulse">Fetching latest updates...</p>
                    </div>
                ) : filteredAnnouncements.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAnnouncements?.map((ann) => (
                            <div
                                key={ann._id}
                                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 dark:text-white"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeStyles(ann.type)}`}>
                                        {ann.type}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(ann?.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2  transition-colors">
                                    {ann.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {ann.content}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                                            {ann.createdBy?.name?.charAt(0) || "A"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
                                                {ann.createdBy?.name || "Administrator"}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-500">
                                                {ann.createdBy?.role?.name || "Staff"}
                                            </p>
                                        </div>
                                    </div>

                                    {ann.expiryDate && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                                            <Clock size={12} />
                                            Expires: {new Date(ann.expiryDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                        <div className="inline-flex p-6 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-6">
                            <Megaphone size={48} className="text-gray-300 dark:text-gray-700" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No announcements found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            There are no active announcements at the moment. Check back later for updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcement;
