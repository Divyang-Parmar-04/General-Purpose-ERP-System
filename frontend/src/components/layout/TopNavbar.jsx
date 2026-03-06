
import { Menu, Bell, Search, Moon, Sun, BellIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserProfileDropdown from "./UserProfileDropdown";
import { logout } from "../../store/slices/auth.slice";
import { toggleTheme } from "../../store/slices/theme.slice";
import { sendLogoutRequestAPI } from "../../utils/auth/auth.util";
import { useSelector } from "react-redux";
import UserProfile from "./UserProfile";

import NotificationPanel from "./NotificationPanel";
import { getNotificationsAPI } from "../../utils/common/notification.util";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";

import { setUnreadCount } from "../../store/slices/notification.slice";

const TopNavbar = ({ collapsed, setCollapsed, user }) => {

  // console.log(user)
  const [open, setOpen] = useState(false);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const socket = useSocket();

  const [isOpen, setIsOpen] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchUnreadCount = async () => {
    const res = await getNotificationsAPI();
    if (res.success) {
      dispatch(setUnreadCount(res.unreadCount));
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await sendLogoutRequestAPI()
      toast.success(res.message)
      setOpen(false);
      setTimeout(() => { navigate("/") }, 500)
      setTimeout(() => { dispatch(logout()); }, 1000);
    } catch (error) {
      toast.error("Logout error")
    }
  };
  

  return (
    <>

      {isOpen && (<UserProfile setIsOpen={setIsOpen} user={user} />)}

      <header className="h-16 bg-white z-20 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0  transition-colors">
        <div className="flex items-center gap-4 ">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-950 animate-pulse"></span>
              )}
            </button>
            <NotificationPanel
              isOpen={notificationOpen}
              onClose={() => {
                setNotificationOpen(false);
                dispatch(setUnreadCount(0));
              }}
            />
          </div>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
            aria-label="Toggle Theme"
          >
            {mode === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{user?.name || 'User'}</p>
            </div>
          </button>

          {open && (
            <div className="absolute top-full cursor-pointer right-4 mt-1">
              <UserProfileDropdown user={user} onLogout={handleLogout} onClick={() => setOpen(false)} setIsOpen={() => setIsOpen(true)} />
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default TopNavbar;
