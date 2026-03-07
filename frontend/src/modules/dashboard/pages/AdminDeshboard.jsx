import React, { useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ClipboardList,
  Users,
  Wallet,
  Package,
  Target,
  LayoutDashboard,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboardStats } from "../../../utils/admin/dashboard.util";
import toast from "react-hot-toast";

// chart colors should be blue-600 in light mode and blue-500 when dark
const LIGHT_CHART_COLOR = "#2563eb"; // bg-blue-600
const DARK_CHART_COLOR = "#3b82f6"; // bg-blue-500


const STAT_CONFIG = [
  { key: "employees", label: "Total Employees", icon: Users, color: "text-blue-600 dark:text-blue-500", modules: ["hr"] },
  // { key: "revenue", label: "Total Revenue", icon: Wallet, color: "text-blue-600 dark:text-blue-500", modules: ["sales"] },
  { key: "pendingTasks", label: "Pending Tasks", icon: ClipboardList, color: "text-blue-600 dark:text-blue-500", modules: ["tasks"] },
  { key: "activeProjects", label: "Active Projects", icon: Target, color: "text-blue-600 dark:text-blue-500", modules: ["projects"] },
  { key: "totalProducts", label: "Total Products", icon: Package, color: "text-blue-600 dark:text-blue-500", modules: ["inventory"] },
  { key: "departments", label: "Total Departments", icon: LayoutDashboard, color: "text-blue-600 dark:text-blue-500", modules: ["hr"] },
  { key: "accounts", label: "Total Accounts", icon: Wallet, color: "text-blue-600 dark:text-blue-500", modules: ["accounting"] },
  { key: "vendors", label: "Total Vendors", icon: Users, color: "text-blue-600 dark:text-blue-500", modules: ["procurement"] },
  { key: "purchaseOrders", label: "Active POs", icon: Package, color: "text-blue-600 dark:text-blue-500", modules: ["procurement"] },
  { key: "leads", label: "Total Leads", icon: Target, color: "text-blue-600 dark:text-blue-500", modules: ["crm"] },
];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // detect tailwind dark class so charts can adapt
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(() => {
      check();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const chartColor = isDarkMode ? DARK_CHART_COLOR : LIGHT_CHART_COLOR;

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load dashboard data");
        toast.error(res.message || "Dashboard load failed");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats = {}, charts = {}, lists = {}, alerts = {}, enabledModules = {} } = data || {};

  const visibleStats = STAT_CONFIG.filter(
    (stat) =>
      stat.key in stats &&
      stats[stat.key] !== undefined &&
      stats[stat.key] !== null &&
      (!stat.modules || stat.modules.some((m) => enabledModules[m]))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8  sm:pt-8 space-y-6 sm:space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-600/10 rounded-lg">
              <LayoutDashboard className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-[12px] sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Real-time overview of key metrics
              </p>
            </div>
          </div>
          <div>

            <button
              onClick={fetchStats}
              className="p-2.5 border dark:text-white cursor-pointer border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw size={18} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {visibleStats.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <Icon size={18} className={`${color} opacity-80 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform`} />
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {typeof stats[key] === "number" ? stats[key].toLocaleString() : stats[key] || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Revenue Trend */}
          {/* {enabledModules?.sales && charts?.revenueTrend?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                  Revenue Trend
                </h2>
              </div>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.revenueTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: '8px', color: "#f3f4f4", fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )} */}

          {/* Task Status Distribution */}
          {enabledModules?.tasks && charts?.taskStatus && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Task Breakdown
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(charts.taskStatus).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Project Status Distribution */}
          {enabledModules?.projects && charts?.projectStatus && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Project Breakdown
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(charts.projectStatus).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Transaction Trend */}
          {enabledModules?.accounting && charts?.transactionTrend?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                  Transactions
                </h2>
              </div>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.transactionTrend}>
                    <defs>
                      <linearGradient id="colorTransaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: '8px', color: "#f3f4f6", fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#colorTransaction)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Lead Status Distribution */}
          {enabledModules?.crm && charts?.leadStatus && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Lead Breakdown
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(charts.leadStatus).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Inventory Categories Distribution */}
          {enabledModules?.inventory && charts?.inventoryCategories && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Inventory Categories
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(charts.inventoryCategories).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Purchase Order Status Distribution */}
          {enabledModules?.procurement && charts?.poStatus && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                PO Status Breakdown
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(charts.poStatus).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Department Employee Distribution */}
          {enabledModules?.hr && charts?.departmentEmployees?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Employees per Dept
              </h2>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.departmentEmployees}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="department" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#374151", opacity: 0.1 }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="employees" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activities & Detailed Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Recent Tasks */}
          {enabledModules?.tasks && lists?.recentTasks?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Recent Tasks
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.recentTasks.map((task) => (
                  <div key={task._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">{task.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{task.project || "General Task"}</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${task.status === "Done" ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                        : task.status === "In Progress" ? "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
                          : "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Projects */}
          {enabledModules?.projects && lists?.recentProjects?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Recent Projects
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.recentProjects.map((project) => (
                  <div key={project._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">{project.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate pr-4">{project.description || "Active project"}</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${project.status === "COMPLETED" ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                        : "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
                      }`}>
                      {project.status.split('_').join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Leads */}
          {enabledModules?.crm && lists?.recentLeads?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Recent Leads
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.recentLeads.map((lead) => (
                  <div key={lead._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">{lead.contact.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{lead.organizationName || "Indiviual Lead"}</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${lead.status === "WON" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : lead.status === "LOST" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Items */}
          {enabledModules?.inventory && lists?.lowStockItems?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500 sm:w-5 sm:h-5" />
                Low Stock Warning
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.lowStockItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-amber-600 transition-colors">{item.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <span className="ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {enabledModules?.accounting && lists?.recentTransactions?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Latest Transactions
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">#{tx.referenceNumber || "EXP-001"}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{tx.description?.substring(0, 30) || "No description"}...</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${tx.status === "COMPLETED" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {tx.transactionType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Purchase Orders */}
          {enabledModules?.procurement && lists?.recentPurchaseOrders?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Package size={18} className="text-blue-600 dark:text-blue-500 sm:w-5 sm:h-5" />
                Activity Feed (POs)
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {lists.recentPurchaseOrders.map((po) => (
                  <div key={po._id} className="flex justify-between items-center py-3 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">{po.poNumber}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Vendor: {po.vendorId?.name || "Global Vendor"}</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${po.status === "RECEIVED" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}>
                      {po.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;