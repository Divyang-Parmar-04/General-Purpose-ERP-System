import MenuItem from "./MenuItem";
import MenuSection from "./MenuSection";
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Layers,
  Wallet,
  Boxes,
  BarChart3,
  Briefcase,
  UserCog,
  FileText,
  ShoppingCart,
  ShieldCheck,
  Folder,
  Link2,
  TrendingUp,
  Calculator,
  PackageSearch,
  FileArchive,
  Settings,
  Megaphone,
  CreditCard,
} from "lucide-react";

export const ADMIN_MODULES = {

  /* ================= CORE ================= */
  core: {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    section: "Main"
  },

  tasks: {
    label: "Tasks",
    icon: ClipboardList,
    path: "/admin/tasks",
    section: "Main"
  },

  projects: {
    label: "Projects",
    icon: Folder,
    path: "/admin/projects",
    section: "Main"
  },

  /* ================= ORGANIZATION ================= */

  userManagement: {
    label: "Employees",
    icon: Users,
    path: "/admin/employees",
    section: "Organization"
  },

  departments: {
    label: "Departments",
    icon: Layers,
    path: "/admin/departments",
    section: "Organization"
  },

  hr: {
    label: "HR Management",
    icon: UserCog,
    path: "/admin/hr",
    section: "Organization"
  },

  announcements: {
    label: "Announcements",
    icon: Megaphone,
    path: "/admin/announcements",
    section: "Organization"
  },

  /* ================= BUSINESS / OPERATIONS ================= */
  crm: {
    label: "CRM",
    icon: Briefcase,
    path: "/admin/crm",
    section: "Operations"
  },

  sales: {
    label: "Sales",
    icon: ShoppingCart,
    path: "/admin/sales",
    section: "Operations"
  },

  procurement: {
    label: "Procurement",
    icon: PackageSearch,
    path: "/admin/procurement",
    section: "Operations"
  },

  inventory: {
    label: "Inventory",
    icon: Boxes,
    path: "/admin/inventory",
    section: "Operations"
  },

  documents: {
    label: "Documents",
    icon: FileArchive,
    path: "/admin/documents",
    section: "Operations"
  },

  /* ================= FINANCE ================= */
  finance: {
    label: "Finance",
    icon: Wallet,
    path: "/admin/finance",
    section: "Finance"
  },

  accounting: {
    label: "Accounting",
    icon: Calculator,
    path: "/admin/accounting",
    section: "Finance"
  },

  taxation: {
    label: "Taxation",
    icon: FileText,
    path: "/admin/taxation",
    section: "Finance"
  },

  payroll: {
    label: "Payroll",
    icon: CreditCard,
    path: "/admin/finance/payroll",
    section: "Finance"
  },

  /* ================= ANALYTICS & REPORTS ================= */
  reports: {
    label: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
    section: "Analytics"
  },

  /* ================= SYSTEM ================= */
  // integrations: {
  //   label: "Integrations",
  //   icon: Link2,
  //   path: "/admin/integrations",
  //   section: "System"
  // },

  auditLogs: {
    label: "Audit Logs",
    icon: ShieldCheck,
    path: "/admin/audit-logs",
    section: "System"
  },

};


import { useSelector } from "react-redux";

const AdminMenu = ({ collapsed, setCollapsed }) => {

  const { user } = useSelector((state) => state.auth)

  const location = useLocation();
  const activePath = location.pathname;

  // Calculate modules while filtering based on 'enabled' status from user object
  // BUT iterate over ADMIN_MODULES keys to preserve the UI order defined in code.

  const enabledModules = Object.keys(ADMIN_MODULES)
    .filter((key) => user.businessId?.modules?.[key])
    .map((key) => ADMIN_MODULES[key]);

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

export default AdminMenu;