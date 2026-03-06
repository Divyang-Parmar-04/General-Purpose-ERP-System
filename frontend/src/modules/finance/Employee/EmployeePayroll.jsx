import React, { useEffect, useState } from "react";
import {
    Wallet,
    Calendar,
    Download,
    TrendingUp,
    Building,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { getMySalaryConfig, getMySalaryHistory } from "../../../utils/employee/payroll.util";
import toast from "react-hot-toast";

const EmployeePayroll = () => {
    const [config, setConfig] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [configRes, historyRes] = await Promise.all([
                    getMySalaryConfig(),
                    getMySalaryHistory()
                ]);

                if (configRes.success) setConfig(configRes.data);
                if (historyRes.success) setHistory(historyRes.data);
            } catch (error) {
                // Config might be 404 if not set, that's okay
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
            PAID: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
            APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
            PENDING_APPROVAL: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        };

        const icons = {
            PAID: <CheckCircle2 size={14} />,
            APPROVED: <CheckCircle2 size={14} />,
            PENDING_APPROVAL: <Clock size={14} />,
            DRAFT: <AlertCircle size={14} />
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
                {icons[status]}
                {status.replace(/_/g, " ")}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="p-3 bg-green-600/10 rounded-xl">
                        <Wallet className="w-8 h-8 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            My Payroll
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Salary structure and payment history
                        </p>
                    </div>
                </div>

                {!config ? (
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Salary Configuration</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Your payroll structure has not been assigned yet. Please contact HR or Finance.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Salary Structure Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Building size={20} className="text-gray-400" />
                                        Salary Structure
                                    </h2>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                        {config.structureId?.name || "Standard"}
                                    </span>
                                </div>
                                <div className="p-6 grid md:grid-cols-2 gap-8">

                                    {/* Earnings */}
                                    <div>
                                        <h3 className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-4">Earnings</h3>
                                        <div className="space-y-3">
                                            {config.computedEarnings?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center font-semibold">
                                                <span className="text-gray-900 dark:text-gray-100">Total Earnings</span>
                                                <span className="text-green-600 dark:text-green-400">
                                                    {formatCurrency(config.computedEarnings.reduce((a, b) => a + b.amount, 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <h3 className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-4">Deductions</h3>
                                        <div className="space-y-3">
                                            {config.computedDeductions?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center font-semibold">
                                                <span className="text-gray-900 dark:text-gray-100">Total Deductions</span>
                                                <span className="text-red-600 dark:text-red-400">
                                                    -{formatCurrency(config.computedDeductions.reduce((a, b) => a + b.amount, 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Net Monthly Salary</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {formatCurrency(config.netSalary)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-1">Effective Date</p>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {new Date(config.effectiveDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Card */}
                        <div>
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <CreditCard size={20} className="text-gray-400" />
                                    Payment Details
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Bank Name</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                            {config.paymentDetails?.bankName || "Not set"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Account Number</p>
                                        <p className="font-mono font-medium text-gray-900 dark:text-gray-100 mt-1">
                                            {config.paymentDetails?.accountNumber || "****"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase">IFSC Code</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {config.paymentDetails?.ifscCode || "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase">PAN</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {config.paymentDetails?.panNumber || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <TrendingUp size={20} className="text-gray-400" />
                            Payment History {new Date().getFullYear()}
                        </h2>
                    </div>
                    {history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Month</th>
                                        <th className="px-6 py-4 text-right">Gross Pay</th>
                                        <th className="px-6 py-4 text-right">Deductions</th>
                                        <th className="px-6 py-4 text-right">Net Pay</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Pay Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {history.map((slip) => (
                                        <tr key={slip._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                                {new Date(0, slip.month - 1).toLocaleString('default', { month: 'long' })} {slip.year}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                                                {formatCurrency(slip.grossSalary)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-red-500 dark:text-red-400">
                                                -{formatCurrency(slip.totalDeductions)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(slip.netPayable)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(slip.status)}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500">
                                                {slip.paymentDate ? new Date(slip.paymentDate).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded transition-colors"
                                                    onClick={() => toast.success("Slip download started...")}
                                                >
                                                    <Download size={14} />
                                                    Slip
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No payment history found for this period.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EmployeePayroll;
