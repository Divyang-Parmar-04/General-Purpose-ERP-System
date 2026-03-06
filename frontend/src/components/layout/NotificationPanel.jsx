import React, { useEffect } from "react";
import { Bell, Check, X, Megaphone, ClipboardList, Info } from "lucide-react";
import { getNotificationsAPI, markAsReadAPI } from "../../utils/common/notification.util";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setNotifications, setUnreadCount, markRead, setLoading } from "../../store/slices/notification.slice";

const NotificationPanel = ({ isOpen, onClose }) => {

    const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchNotifications = async () => {

        dispatch(setLoading(true));

        const res = await getNotificationsAPI();
        if (res.success) {
            dispatch(setNotifications(res.notifications));
            dispatch(setUnreadCount(res.unreadCount));
        }
        dispatch(setLoading(false));
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id) => {
        const res = await markAsReadAPI(id);
        if (res.success) {
            dispatch(markRead(id));
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id);
        }

        onClose();

        // Redirect based on type
        if (notification.type === "ANNOUNCEMENT") {
            navigate("/employee/announcements");
        } else if (notification.type === "TASK") {
            navigate("/employee/mytasks");
        }
    };

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case "ANNOUNCEMENT": return <Megaphone className="w-4 h-4 text-blue-500" />;
            case "TASK": return <ClipboardList className="w-4 h-4 text-green-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="absolute -right-15 md:right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={() => handleMarkAsRead("all")}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors relative flex gap-3 ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="mt-1 shrink-0 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {n.message}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center">
                        <Bell className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50/30 dark:bg-gray-800/30">
                <p className="text-[10px] text-gray-400">Showing last 20 notifications</p>
            </div>
        </div>
    );
};

export default NotificationPanel;
