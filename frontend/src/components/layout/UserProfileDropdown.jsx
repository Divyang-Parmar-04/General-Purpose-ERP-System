
const UserProfileDropdown = ({ user, onLogout, onClick, setIsOpen }) => {

  const handleonClick = () => {
    setIsOpen()
    onClick()
  }

  return (
    <>
      <div className="w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow-md overflow-hidden transition-colors ">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
          <p className="text-[12px] text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
        </div>

        <div className="p-1">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded"
            onClick={handleonClick}>
            Profile Settings
          </button>
          <div className="my-1 h-px bg-gray-100 dark:bg-gray-800"></div>
          <button
            onClick={onLogout}
            className="w-full text-left px-3 cursor-pointer py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfileDropdown;
