import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Activity,
  Target,
  Zap,
  RefreshCw,
  ArrowUpRight,
  DollarSign,
  Package
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getReportSummary } from "../../../utils/admin/reports.util";
import toast from "react-hot-toast";

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const AnalyticsManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getReportSummary();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load analytics");
      }
    } catch (error) {
      console.error("Analytics Error:", error);
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = data
    ? [
      {
        label: "Conversion Rate",
        value: data.conversionRate || "0%",
        icon: Zap,
        color: "text-amber-600",
        bg: "bg-amber-100 dark:bg-amber-900/20"
      },
      {
        label: "Avg Order Value",
        value: `₹${data.avgOrderValue?.toLocaleString() || 0}`,
        icon: Target,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20"
      },
      {
        label: "Monthly Burn Rate",
        value: `₹${data.burnRate?.toLocaleString() || 0}`,
        icon: Activity,
        color: "text-red-600",
        bg: "bg-red-100 dark:bg-red-900/20"
      },
      {
        label: "Inventory Turnover",
        value: data.turnover || "0x",
        icon: Package,
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/20"
      },
    ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Overview of business performance and financial health.
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Refresh</span>
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
                {/* <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metric</span> */}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {kpi.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revenue Trend</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly revenue for the last 6 months</p>
            </div>

            <div className="h-80 w-full">
              {data?.revenueProgress?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'transparent' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      activeBar={{ fill: '#1d4ed8' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No revenue data available</div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cost Structure</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Top operational expenses</p>
            </div>

            <div className="h-64 w-full relative">
              {data?.costBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val, name, props) => [`${val}% (₹${props.payload.amount.toLocaleString()})`, props.payload.label]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expenses data available</div>
              )}
              {/* Center Text for Donut */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-gray-400 uppercase">Expenses</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {data?.costBreakdown?.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;