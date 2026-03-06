import MenuItem from "./MenuItem";
import MenuSection from "./MenuSection";
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  Clock,
  Wallet,
  Megaphone,
  User,
  FileArchive,
  Folder,
  UserCog,
  CreditCard,
  Boxes,
  BarChart3,
  PackageSearch

} from "lucide-react";
import { useSelector } from "react-redux";

const CORE_MODULE_KEYS = [
  "core",
  "tasks",
  "attendance",
  "leaves",
  "announcements",
  "documents",
  // "procurement",
  // "inventory",
  // "payroll"
];


export const EmployeeModules = {

  /* ================= CORE (ALWAYS VISIBLE) ================= */

  core: {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/employee/dashboard",
    section: "Main"
  },

  tasks: {
    label: "My Tasks",
    icon: ClipboardList,
    path: "/employee/mytasks",
    section: "Main"
  },

  attendance: {
    label: "Attendance",
    icon: Clock,
    path: "/employee/attendance",
    section: "Main"
  },

  leaves: {
    label: "Leaves",
    icon: CalendarCheck,
    path: "/employee/leaves",
    section: "Main"
  },

  announcements: {
    label: "Announcements",
    icon: Megaphone,
    path: "/employee/announcements",
    section: "Main"
  },

  documents: {
    label: "Documents",
    icon: FileArchive,
    path: "/employee/documents",
    section: "Main"
  },

  /* ================= PERMISSION BASED (ADMIN CONTROLLED) ================= */

  // projects: {
  //   label: "Projects",
  //   icon: Folder,
  //   path: "/employee/projects",
  //   section: "Work"
  // },

  // hr: {
  //   label: "HR",
  //   icon: UserCog,
  //   path: "/employee/hr",
  //   section: "Organization"
  // },

  // finance: {
  //   label: "Finance",
  //   icon: Wallet,
  //   path: "/employee/finance",
  //   section: "Finance"
  // },

  // payroll: {
  //   label: "Payroll",
  //   icon: CreditCard,
  //   path: "/employee/payroll",
  //   section: "Finance"
  // },

  inventory: {
    label: "Inventory",
    icon: Boxes,
    path: "/employee/inventory",
    section: "Operations"
  },
  procurement: {
    label: "Procurement",
    icon: PackageSearch,
    path: "/employee/procurement",
    section: "Operations"
  },
  // reports: {
  //   label: "Reports",
  //   icon: BarChart3,
  //   path: "/employee/reports",
  //   section: "Analytics"
  // }

};

const EmployeeMenu = ({ collapsed, setCollapsed }) => {
  const { user } = useSelector((state) => state.auth)


  const location = useLocation();
  const activePath = location.pathname;

  const enabledModules = Object.entries(EmployeeModules)
    .filter(([key]) =>
      CORE_MODULE_KEYS.includes(key) ||
      user?.modules?.includes(key)
    )
    .map(([_, module]) => module);



  const groupedModules = enabledModules.reduce((acc, module) => {
    acc[module.section] = acc[module.section] || [];
    acc[module.section].push(module);
    return acc;


  }, {});


  return (
    <div className="space-y-1">
      <>
        {Object.entries(groupedModules).map(([section, items]) => (
          <MenuSection key={section} title={section} collapsed={collapsed}>
            {items.map((item) => (
              <MenuItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                to={item.path}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isActive={activePath === item.path}
              />
            ))}
          </MenuSection>
        ))}

      </>

    </div>
  );
};

export default EmployeeMenu;