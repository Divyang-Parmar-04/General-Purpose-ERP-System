import { useSelector } from "react-redux";
import AdminMenu from "./sidebar/AdminMenu";
import EmployeeMenu from "./sidebar/EmployeeMenu";
import { Building2, Settings } from "lucide-react";
import MenuItem from "./sidebar/MenuItem";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = ({ collapsed, setCollapsed: setMenuCollapsed }) => {
    const { role, user } = useSelector((state) => state.auth);
    const [isLocalCollapsed, setIsLocalCollapsed] = useState(false);

    const location = useLocation();
    const activePath = location.pathname;

    useEffect(() => {
        if (!collapsed) {
            setTimeout(() => {
                setIsLocalCollapsed(false);
            }, 100);
        } else {
            setIsLocalCollapsed(true);
        }
    }, [collapsed]);

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 transition-all duration-300 transform w-64
                ${collapsed ? "-translate-x-full" : "translate-x-0"}
                md:relative md:translate-x-0 ${collapsed ? "md:w-16" : "md:w-64"}
                bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 
                flex flex-col h-full
            `}
        >
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {!isLocalCollapsed && (
                        <span className="font-bold text-gray-900 dark:text-white uppercase text-sm">ERP Master</span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 relative">
                {role === "ADMIN" && <AdminMenu collapsed={collapsed} setCollapsed={setMenuCollapsed} />}
                {role === "EMPLOYEE" && <EmployeeMenu collapsed={collapsed} setCollapsed={setMenuCollapsed} />}
            </div>


            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 shrink-0">
                {role === "ADMIN" && (
                    <div className="my-1.5">
                        {collapsed && <div className="h-px bg-gray-200 dark:bg-gray-800 mx-1"></div>}
                        <div className="space-y-0.5 mx-2">
                            <MenuItem
                                key={"/admin/settings"}
                                icon={Settings}
                                label={"System Setting"}
                                to={"/admin/settings"}
                                collapsed={collapsed}
                                setCollapsed={setMenuCollapsed}
                                isActive={activePath === "/admin/settings"}
                            />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
