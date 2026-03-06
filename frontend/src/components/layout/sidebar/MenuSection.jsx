const MenuSection = ({ title, collapsed, children }) => {
  return (
    <div className="mb-4">
      {!collapsed && (
        <h3 className="px-3 mb-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {collapsed && <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-1"></div>}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
};

export default MenuSection;