import React, { useEffect, useState } from "react";
import {
    getAllEmployeesAPI,
    createEmployeeAPI,
    updateEmployeeAPI,
    deleteEmployeeAPI,
} from "../../../../utils/admin/user.util";
import { getAllDepartmentsAPI } from "../../../../utils/admin/department.util";
import { toast } from "react-hot-toast";
import { X, RefreshCw, Plus, User, Users } from "lucide-react";
import { useSelector } from "react-redux";

function Employees() {
    const { user } = useSelector((state) => state.auth);

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [modulesList, setModules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        departmentId: "",
        phone: "",
        managerId: "",
        dateOfJoining: "",
        status: "INACTIVE",
        role: {
            name: "EMPLOYEE",
            domain: "",
            description: "",
            modules: [],
            permissions: [],
        },
    });

    const permissionsList = ["READ", "WRITE", "DELETE"];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empsRes, deptsRes] = await Promise.all([
                getAllEmployeesAPI(),
                getAllDepartmentsAPI(),
            ]);

            setEmployees(empsRes?.data || empsRes || []);
            setDepartments(deptsRes?.data || deptsRes || []);

            let availableModules = [];
            // if (user?.role?.name === "ADMIN") {
            //     for (let [key, value] of Object.entries(user?.businessId?.modules || {})) {
            //         if (value) availableModules.push(key.toUpperCase());
            //     }
            // } else {
            //     availableModules = user?.role?.modules || [];
            // }
            setModules(["PROCUREMENT", "INVENTORY"]);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        const essential = modulesList.filter((m) =>
            ["HR", "TASKS", "CORE"].includes(m.toUpperCase())
        );

        setForm({
            name: "",
            email: "",
            departmentId: "",
            managerId: "",
            dateOfJoining: "",
            status: "INACTIVE",
            role: {
                name: "EMPLOYEE",
                domain: "",
                description: "",
                modules: essential,
                permissions: [],
            },
        });
        setEditingEmployee(null);
    };

    const toggleNestedValue = (key, value) => {
        setForm((prev) => ({
            ...prev,
            role: {
                ...prev.role,
                [key]: prev.role[key].includes(value)
                    ? prev.role[key].filter((v) => v !== value)
                    : [...prev.role[key], value],
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                name: form.name,
                email: form.email,
                departmentId: form.departmentId || null,
                managerId: form.managerId || null,
                dateOfJoining: form.dateOfJoining || null,
                status: form.status,
                phone: form.phone,
                role: {
                    name: "EMPLOYEE",
                    domain: form.role.domain,
                    modules: form.role.modules,
                    permissions: form.role.permissions,
                },
            };

            if (editingEmployee) {
                await updateEmployeeAPI(editingEmployee._id, payload);
                toast.success("Employee updated");
            } else {
                const emp = await createEmployeeAPI(payload);
                if (emp?.error == "mailerror") {
                    toast.error("failed to send email");
                }
                else if (emp?.error) {
                    toast.error("Employee Already Exist");
                } else {
                    toast.success("Employee created");
                }
            }

            setShowForm(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);

        setForm({
            name: emp.name || "",
            email: emp.email || "",
            departmentId: emp.departmentId?._id || emp.departmentId || "",
            managerId: emp.managerId?._id || emp.managerId || "",
            dateOfJoining: emp.dateOfJoining?.slice(0, 10) || "",
            status: emp.status || "INACTIVE",
            phone: emp.phone || '',
            role: {
                name: emp.role?.name || "EMPLOYEE",
                domain: emp.role?.domain || "",
                description: emp.role?.description || "",
                modules: emp.role?.modules || [],
                permissions: emp.role?.permissions || [],
            },
        });

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this employee?")) return;
        try {
            await deleteEmployeeAPI(id);
            toast.success("Employee deleted");
            fetchData();
        } catch (err) {
            console.log(err)
            toast.error("Delete failed");
        }
    };

    const filteredEmployees =
        filter === "ALL"
            ? employees
            : employees.filter((e) => e.status === filter);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-lg">
                            <Users className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                Employees
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Team members & access control
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="p-2.5 border dark:text-white cursor-pointer border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            <Plus size={18} />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${filter === s
                                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%]">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Department</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading employees...</td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No employees found</td></tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-4 dark:text-white font-medium">{emp.name || "—"}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{emp.email || "—"}</td>
                                        <td className="p-4 dark:text-white">{emp.departmentId?.name || "—"}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${emp.status === "ACTIVE"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                }`}>
                                                {emp.status || "INACTIVE"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp._id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Add / Edit Employee Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 dark:text-white">
                        <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700  flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 rounded-full"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            disabled={!!editingEmployee}
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="email@company.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Department
                                        </label>
                                        <select
                                            value={form.departmentId}
                                            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">No Department</option>
                                            {departments.map((d) => (
                                                <option key={d._id} value={d._id}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Manager
                                        </label>
                                        <select
                                            value={form.managerId}
                                            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">No Manager</option>
                                            {employees
                                                .filter((e) => e._id !== (editingEmployee?._id || ""))
                                                .map((e) => (
                                                    <option key={e._id} value={e._id}>
                                                        {e.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Date of Joining
                                        </label>
                                        <input
                                            type="date"
                                            disabled={!!editingEmployee}
                                            value={form.dateOfJoining}
                                            onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="SUSPENDED">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Domain / Job Title
                                        </label>
                                        <input
                                            value={form.role.domain}
                                            onChange={(e) =>
                                                setForm({ ...form, role: { ...form.role, domain: e.target.value } })
                                            }
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Software Development"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                            Modules Access
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {modulesList.map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => toggleNestedValue("modules", m.toLowerCase())}
                                                    className={`px-3 cursor-pointer py-1.5 text-xs font-medium rounded border transition-colors ${form.role.modules.includes(m.toLowerCase())
                                                        ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                                                        : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                        Permissions
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {permissionsList.map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => toggleNestedValue("permissions", p)}
                                                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${form.role.permissions.includes(p)
                                                    ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                                                    : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div> */}

                                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        className="flex-1 py-3 cursor-pointer bg-gray-100 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                                        {editingEmployee ? "Update Employee" : "Create Employee"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Employees;