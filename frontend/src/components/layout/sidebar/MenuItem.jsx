import { NavLink } from "react-router-dom";

const MenuItem = ({ icon: Icon, label, to, collapsed, setCollapsed, isActive: activeProp = false }) => {
  const handleClick = () => {
    if (window.innerWidth < 768 && setCollapsed) {
      setCollapsed(true);
    }
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive || activeProp
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
    >
      <Icon className="w-4 h-4 shrink-0" />

      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}

      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50">
          {label}
        </div>
      )}
    </NavLink>
  )
};

export default MenuItem;