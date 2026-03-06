import React, { useEffect, useState } from 'react';
import {
    CreditCard,
    Plus,
    Users,
    FileText,
    CheckCircle,
    Play,
    Calendar,
    Search
} from 'lucide-react';
import {
    getStructures,
    createStructure,
    getSalarySlips,
    generatePayroll,
    updateSlipStatus
} from '../../../utils/admin/payroll.util';
import toast from 'react-hot-toast';

const PayrollManagement = ({ data }) => {

    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [stats, setStats] = useState({ totalPaid: 0, pendingCount: 0 });
    const [slips, setSlips] = useState([]);
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generation State
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
    const [genYear, setGenYear] = useState(new Date().getFullYear());

    // New Structure State
    const [showStructForm, setShowStructForm] = useState(false);
    const [newStruct, setNewStruct] = useState({ name: '', earnings: [], deductions: [] });

    useEffect(() => {
        if (activeTab === 'OVERVIEW') fetchSlips();
        if (activeTab === 'STRUCTURES') fetchStructures();
        if (activeTab === 'PAYROLL') fetchSlips();
    }, [activeTab]);

    const fetchSlips = async () => {
        setLoading(true);
        try {
            const res = await getSalarySlips({ month: genMonth, year: genYear });
            if (res.success) {
                setSlips(res.data);
                // Calculate stats
                const paid = res.data.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.netPayable, 0);
                const pending = res.data.filter(s => ['DRAFT', 'PENDING_APPROVAL'].includes(s.status)).length;
                setStats({ totalPaid: paid, pendingCount: pending });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const res = await getStructures();
            if (res.success) setStructures(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm(`Generate payroll for ${genMonth}/${genYear}? This will create slips for all active employees.`)) return;

        setLoading(true);
        try {
            const res = await generatePayroll({ month: genMonth, year: genYear });
            if (res.success) {
                toast.success(res.message);
                fetchSlips();
            } else {
                toast.error("Generation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await updateSlipStatus(id, status);
            if (res.success) {
                toast.success("Status updated");
                fetchSlips(); // Refresh
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleCreateStructure = async (e) => {
        e.preventDefault();
        try {
            // Simplified: Add default components for demo
            const payload = {
                name: newStruct.name,
                description: "Basic Structure Created via Quick Admin",
                earnings: [
                    { name: "Basic Salary", type: "PERCENTAGE", value: 50, calculationBasis: "GROSS" },
                    { name: "HRA", type: "PERCENTAGE", value: 20, calculationBasis: "GROSS" }
                ],
                deductions: [
                    { name: "PF", type: "FIXED", value: 1800 }
                ]
            };

            const res = await createStructure(payload);
            if (res.success) {
                toast.success("Structure Created");
                setShowStructForm(false);
                setNewStruct({ name: '', earnings: [], deductions: [] });
                fetchStructures();
            }
        } catch (error) {
            toast.error("Failed to create");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payroll Management</h1>
                    <p className="text-gray-500">Manage salaries, structures, and payments</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'OVERVIEW' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('STRUCTURES')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'STRUCTURES' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                        Structures
                    </button>
                </div>
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Period:</span>
                            <select
                                value={genMonth}
                                onChange={(e) => setGenMonth(Number(e.target.value))}
                                className="p-2 border rounded"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={genYear}
                                onChange={(e) => setGenYear(Number(e.target.value))}
                                className="p-2 border rounded w-24"
                            />
                        </div>
                        <button
                            onClick={fetchSlips}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            <Search size={20} />
                        </button>
                        <div className="flex-1"></div>
                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Play size={18} /> Run Payroll
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                            <p className="text-gray-500">Total Slips</p>
                            <p className="text-2xl font-bold">{slips.length}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                            <p className="text-gray-500">Pending Approval</p>
                            <p className="text-2xl font-bold">{stats.pendingCount}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-gray-500">Total Paid (This Month)</p>
                            <p className="text-2xl font-bold">₹{stats.totalPaid.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Slips Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                                    <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Employee</th>
                                    <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">Pay Cycle</th>
                                    <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">Net Payable</th>
                                    <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500">
                                            Loading payroll records...
                                        </td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500">
                                            No payroll records found
                                        </td>
                                    </tr>
                                ) : (
                                    data?.map((pay) => (
                                        <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4 font-medium">{pay.employeeId?.name || "—"}</td>
                                            <td className="p-4">
                                                {(() => {
                                                    const year = Number(pay?.year);
                                                    const month = Number(pay?.month);

                                                    if (!year || !month || month < 1 || month > 12) return "—";

                                                    const date = new Date(year, month - 1);

                                                    return (
                                                        <>
                                                            {new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)} {year}
                                                        </>
                                                    );
                                                })()}
                                            </td>
                                            <td className="p-4 text-center font-medium">
                                                ₹{(pay.netPayable || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span
                                                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${pay.paymentStatus === "PAID"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                                        }`}
                                                >
                                                    {pay.paymentStatus || "PENDING"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'STRUCTURES' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowStructForm(!showStructForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} /> New Structure
                        </button>
                    </div>

                    {showStructForm && (
                        <div className="bg-white p-4 rounded-xl shadow border">
                            <h3 className="font-bold mb-4">Create Simple Structure</h3>
                            <input
                                className="border p-2 rounded w-full mb-4"
                                placeholder="Structure Name (e.g. Interns)"
                                value={newStruct.name}
                                onChange={e => setNewStruct({ ...newStruct, name: e.target.value })}
                            />
                            <button onClick={handleCreateStructure} className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {structures.map(struct => (
                            <div key={struct._id} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border hover:border-indigo-500 transition-colors">
                                <h3 className="font-bold text-lg">{struct.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{struct.description}</p>
                                <div className="mt-4 space-y-2">
                                    <div className="text-xs font-semibold uppercase text-gray-400">Earnings</div>
                                    <div className="flex flex-wrap gap-2">
                                        {struct.earnings.map((e, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                                {e.name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs font-semibold uppercase text-gray-400 mt-2">Deductions</div>
                                    <div className="flex flex-wrap gap-2">
                                        {struct.deductions.map((d, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                                                {d.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default PayrollManagement;
