import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

import App from "../App";
import Home from "../pages/home/Home";
import Auth from "../pages/auth/auth";
import Setup from "../pages/businessSetup/Setup";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/error/NotFound";
import AdminDeshboard from "../modules/dashboard/pages/AdminDeshboard";
import Employee from "../modules/users/pages/admin/Employee";
import Department from "../modules/users/pages/admin/Department";
import Tasks from "../modules/tasks/Admin/Tasks";
import Projects from "../modules/projects/Admin/Projects";
import HRManagement from "../modules/hr/Admin/HRManagement";
import CRMManagement from "../modules/crm/Admin/CRMManagement";
import SalesManagement from "../modules/sales/Admin/SalesManagement";
import ProcurementManagement from "../modules/procurement/Admin/ProcurementManagement";
import InventoryManagement from "../modules/inventory/Admin/InventoryManagement";
import DocumentManagement from "../modules/documents/Admin/DocumentManagement";
import FinanceManagement from "../modules/finance/Admin/FinanceManagement";
import AccountingManagement from "../modules/finance/Admin/AccountingManagement";
import TaxationManagement from "../modules/finance/Admin/TaxationManagement";
import ReportsManagement from "../modules/reports/Admin/ReportsManagement";
import AnalyticsManagement from "../modules/reports/Admin/AnalyticsManagement";
import AnnouncementManagement from "../modules/core/AnnouncementManagement";
import SettingsPage from "../modules/settings/page/SettingsLayout";
import EmployeeDashboard from "../modules/dashboard/pages/EmployeeDashboard";
import MyTasks from "../modules/tasks/Employee/MyTask";
import EmployeeAttendance from "../modules/hr/employee/EmployeeAttendance";
import Leaves from "../modules/hr/employee/Leaves";
import Announcement from "../modules/core/employee/Announcement";
import EmployeeDocuments from "../modules/documents/Employee/EmployeeDocuments";
import EmployeeProcurement from "../modules/procurement/Employee/EmployeeProcurement";
import EmployeeInventory from "../modules/inventory/Employee/EmployeeInventory";
import EmployeePayroll from "../modules/finance/Employee/EmployeePayroll";
import Unauthorized from "../pages/error/Unauthorized";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Home Page Routes */}
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="auth" element={<Auth />} />
                <Route path="setup" element={<Setup />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles="ADMIN" />}>
                    <Route path="admin/dashboard" element={<AdminDeshboard />} />
                    <Route path="admin/employees" element={<Employee />} />
                    <Route path="admin/departments" element={<Department />} />
                    <Route path="admin/tasks" element={<Tasks />} />
                    <Route path="admin/projects" element={<Projects />} />
                    <Route path="admin/hr" element={<HRManagement />} />
                    <Route path="admin/crm" element={<CRMManagement />} />
                    <Route path="admin/sales" element={<SalesManagement />} />
                    <Route path="admin/procurement" element={<ProcurementManagement />} />
                    <Route path="admin/inventory" element={<InventoryManagement />} />
                    <Route path="admin/documents" element={<DocumentManagement />} />
                    <Route path="admin/finance" element={<FinanceManagement />} />
                    <Route path="admin/accounting" element={<AccountingManagement />} />
                    <Route path="admin/taxation" element={<TaxationManagement />} />
                    <Route path="admin/reports" element={<ReportsManagement />} />
                    <Route path="admin/analytics" element={<AnalyticsManagement />} />
                    <Route path="admin/announcements" element={<AnnouncementManagement />} />
                    <Route path="admin/settings" element={<SettingsPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={"EMPLOYEE"} />}>
                    <Route path="employee/dashboard" element={<EmployeeDashboard />} />
                    <Route path="employee/mytasks" element={<MyTasks />} />
                    <Route path="employee/attendance" element={<EmployeeAttendance />} />
                    <Route path="employee/leaves" element={<Leaves />} />
                    <Route path="employee/announcements" element={<Announcement />} />
                    <Route path="employee/documents" element={<EmployeeDocuments />} />
                    <Route path="employee/procurement" element={<EmployeeProcurement />} />
                    <Route path="employee/inventory" element={<EmployeeInventory />} />
                    <Route path="employee/payroll" element={<EmployeePayroll />} />
                </Route>


                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* 404 */}
                < Route path="*" element={<NotFound />} />

            </Route>


        </>
    ));


export default router;

