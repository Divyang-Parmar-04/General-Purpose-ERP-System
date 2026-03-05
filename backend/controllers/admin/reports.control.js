const User = require("../../models/user.model")
const Sales = require("../../models/sales.model");
const Project = require("../../models/project.model");
const Business = require("../../models/business.model");
const Lead = require("../../models/crm.model");
const Report = require('../../models/report.model');
const { Inventory, Stock } = require("../../models/inventory.model");
const { Leave } = require("../../models/hrms.model")
const { PurchaseOrder } = require("../../models/procurement.model");
const { Transaction } = require("../../models/finance.model");
const { Attendance, Payroll } = require("../../models/hrms.model");

const PDFDocument = require('pdfkit');
const { GoogleGenAI } = require("@google/genai");

const getPrompt = require("../../utils/prompt");
const getAiResponse = require("../../utils/aiModal");
const getHtmlReport = require("../../utils/htmlReport");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Get Unified Report Summary
const handleGetReportSummary = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;

        const [sales, pos, txs, leads, inventory] = await Promise.all([
            Sales.find({ businessId }),
            PurchaseOrder.find({ businessId }),
            Transaction.find({ businessId }),
            Lead.find({ businessId }),
            Inventory.find({ businessId })
        ]);

        // 1. Conversion Rate
        const totalLeads = leads.length;
        const wonLeads = leads.filter(l => l.status === 'WON').length;
        const conversionRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) + "%" : "0%";

        // 2. Avg Order Value (AOV)
        const paidSales = sales.filter(s => s.status === 'PAID');
        const totalRevenue = paidSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
        const avgOrderValue = paidSales.length ? Math.round(totalRevenue / paidSales.length) : 0;

        // 3. Monthly Burn Rate (Last 30 Days Expenses)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentExpenses = txs.filter(t =>
            t.transactionDate >= thirtyDaysAgo &&
            t.entries.some(e => e.debit > 0) // Simplified: any debit is an expense/asset purchase
        );
        const burnRate = recentExpenses.reduce((sum, t) => {
            // Sum debits for relevant categories
            const debit = t.entries.reduce((d, e) => d + (e.debit || 0), 0);
            return sum + debit;
        }, 0);

        // 4. Inventory Turnover (COGS / Avg Inv) ~ roughly Total Sales / Total Current Inventory Value
        const totalInventoryValue = inventory.reduce((sum, i) => sum + ((i.quantity * i.unitPrice) || 0), 0);
        const turnover = totalInventoryValue ? (totalRevenue / totalInventoryValue).toFixed(1) + "x" : "0x";

        // 5. Revenue Progress (Last 6 Months)
        const revenueProgress = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

            const monthSales = paidSales.filter(s => {
                const d = new Date(s.createdAt);
                return d >= targetMonth && d < nextMonth;
            });

            const val = monthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            revenueProgress.push({
                label: monthNames[targetMonth.getMonth()],
                value: val
            }); // Normalized later or sent as raw
        }

        // Normalize revenue for percentage bars (just for UI ease, though UI handles it)
        const maxRev = Math.max(...revenueProgress.map(r => r.value), 1);
        const revenueChart = revenueProgress.map(r => ({
            label: r.label,
            value: Math.round((r.value / maxRev) * 100),
            amount: r.value
        }));

        // 6. Cost Breakdown
        // Categorize by tx category
        const categories = {};
        const allExpenses = txs.filter(t => t.entries.some(e => e.debit > 0));
        allExpenses.forEach(t => {
            const cat = t.category || "General";
            const amt = t.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
            categories[cat] = (categories[cat] || 0) + amt;
        });

        const totalCost = Object.values(categories).reduce((a, b) => a + b, 0);
        const costBreakdown = Object.keys(categories).map(cat => ({
            label: cat,
            value: totalCost ? Math.round((categories[cat] / totalCost) * 100) : 0,
            amount: categories[cat]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 categories

        const report = {
            conversionRate,
            avgOrderValue,
            burnRate,
            turnover,
            revenueProgress: revenueChart,
            costBreakdown
        };

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Error generating reports" });
    }
};

// Fetch Raw Data based on filters (Step 1: Preview before AI generation)
const handleFetchReportData = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { type = 'SUMMARY', filters = {} } = req.body;

        let data = {
            type,
            filters,
            generatedAt: new Date().toLocaleDateString(),
            summary: {},
            rows: [],
            sections: {}
        };

        // Helper to format address
        const formatAddr = (addr) => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            return [addr.addressLine, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ');
        };

        // Fetch Business Details
        const business = await Business.findById(businessId).select('companyName address email phone');
        data.businessInfo = {
            name: business?.companyName,
            address: formatAddr(business?.address),
            email: business?.email,
            phone: business?.phone
        };

        // Build query based on filters
        const buildQuery = (baseQuery) => {
            const query = { ...baseQuery };
            if (filters.fromDate || filters.toDate) {
                const dateField = type === 'FINANCE' ? 'transactionDate' : 'createdAt';
                query[dateField] = {};
                if (filters.fromDate) query[dateField].$gte = new Date(filters.fromDate);
                if (filters.toDate) query[dateField].$lte = new Date(filters.toDate);
            }
            if (filters.status) query.status = filters.status;
            return query;
        };

        // Fetch data based on type
        if (type === 'SALES') {
            const query = buildQuery({ businessId });
            const sales = await Sales.find(query)
                .populate('customerId', 'organizationName contact')
                .sort({ createdAt: -1 })
                .limit(100);

            const paidSales = sales.filter(s => s.status === 'PAID');
            const totalRevenue = paidSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            const pendingRevenue = sales.filter(s => s.status !== 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0);

            data.summary = {
                "Total Orders": sales.length,
                "Paid Orders": paidSales.length,
                "Total Revenue": `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Pending Revenue": `₹${pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Average Order Value": paidSales.length ? `₹${(totalRevenue / paidSales.length).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'
            };

            data.rows = sales.map(s => ({
                Date: new Date(s.createdAt).toLocaleDateString(),
                Invoice: s.invoiceNumber,
                Customer: s.customerId?.organizationName || s.customerId?.contact?.name || 'Guest',
                Amount: `₹${(s.grandTotal || 0).toLocaleString('en-IN')}`,
                Status: s.status,
                "Due Date": s.dueDate ? new Date(s.dueDate).toLocaleDateString() : 'N/A'
            }));

        } else if (type === 'FINANCE') {
            const query = buildQuery({ businessId });
            const txs = await Transaction.find(query)
                .populate('entries.accountId', 'name')
                .sort({ transactionDate: -1 })
                .limit(100);

            const totalDebit = txs.reduce((sum, t) => sum + t.entries.reduce((s, e) => s + (e.debit || 0), 0), 0);
            const totalCredit = txs.reduce((sum, t) => sum + t.entries.reduce((s, e) => s + (e.credit || 0), 0), 0);

            data.summary = {
                "Total Transactions": txs.length,
                "Total Debits": `₹${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Total Credits": `₹${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Net Balance": `₹${(totalCredit - totalDebit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            };

            data.rows = txs.map(t => ({
                Date: t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : 'N/A',
                Description: t.description,
                Category: t.category || 'General',
                Debit: `₹${t.entries.reduce((s, e) => s + (e.debit || 0), 0).toLocaleString('en-IN')}`,
                Credit: `₹${t.entries.reduce((s, e) => s + (e.credit || 0), 0).toLocaleString('en-IN')}`,
                Reference: t.referenceNumber || '-'
            }));

        } else if (type === 'INVENTORY') {
            const stocks = await Stock.find({ businessId }).populate('itemId').limit(100);
            const validStocks = stocks.filter(s => s.itemId);

            const totalValue = validStocks.reduce((sum, s) => {
                const cost = s.itemId.pricing?.costPrice || 0;
                return sum + (s.quantity * cost);
            }, 0);

            const lowStockItems = validStocks.filter(s => s.quantity <= (s.reorderLevel || 10)).length;

            data.summary = {
                "Total Items": validStocks.length,
                "Total Stock Value": `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Low Stock Items": lowStockItems,
                "Average Item Value": validStocks.length ? `₹${(totalValue / validStocks.length).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0'
            };

            data.rows = validStocks.map(s => ({
                Item: s.itemId.name,
                SKU: s.itemId.sku || '-',
                Category: s.itemId.category || '-',
                Stock: s.quantity,
                "Cost Price": `₹${(s.itemId.pricing?.costPrice || 0).toLocaleString('en-IN')}`,
                "Selling Price": `₹${(s.itemId.pricing?.sellingPrice || 0).toLocaleString('en-IN')}`,
                "Total Value": `₹${(s.quantity * (s.itemId.pricing?.costPrice || 0)).toLocaleString('en-IN')}`,
                Status: s.quantity <= (s.reorderLevel || 10) ? 'Low Stock' : 'Adequate'
            }));

        } else if (type === 'PROJECT') {
            const query = buildQuery({ businessId });
            const projects = await Project.find(query)
                .populate('clientId', 'name organizationName')
                .sort({ createdAt: -1 })
                .limit(100);

            const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;
            const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
            const totalBudget = projects.reduce((sum, p) => sum + (p.budget?.estimated || 0), 0);

            data.summary = {
                "Total Projects": projects.length,
                "Active Projects": activeProjects,
                "Completed Projects": completedProjects,
                "On Hold": projects.filter(p => p.status === 'ON_HOLD').length,
                "Total Budget": `₹${totalBudget.toLocaleString('en-IN')}`
            };

            data.rows = projects.map(p => ({
                "Project Name": p.name,
                Client: p.clientId?.organizationName || p.clientId?.name || 'Internal',
                Status: p.status,
                "Start Date": p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
                "End Date": p.endDate ? new Date(p.endDate).toLocaleDateString() : '-',
                Budget: p.budget?.estimated ? `₹${p.budget.estimated.toLocaleString('en-IN')}` : '-',
                Progress: `${p.progress || 0}%`
            }));

        } else if (type === 'EMPLOYEE') {
            const employees = await User.find({ businessId, "role.name": "EMPLOYEE" })
                .populate('departmentId', 'name')
                .select('name email role departmentId status dateOfJoining');

            const today = new Date();
            const activeLeaves = await Leave.find({
                businessId,
                status: 'APPROVED',
                startDate: { $lte: today },
                endDate: { $gte: today }
            }).select('employeeId');

            const onLeaveIds = new Set(activeLeaves.map(l => l.employeeId.toString()));

            data.summary = {
                "Total Employees": employees.length,
                "Active": employees.filter(e => e.status === 'ACTIVE').length,
                "Inactive": employees.filter(e => e.status === 'INACTIVE').length,
                "On Leave": onLeaveIds.size
            };

            data.rows = employees.map(e => ({
                Name: e.name,
                Email: e.email,
                Role: e.role?.name || e.role,
                Department: e.departmentId?.name || '-',
                Status: onLeaveIds.has(e._id.toString()) ? 'ON LEAVE' : e.status,
                "Joined On": e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString() : '-'
            }));

        } else {
            // COMPREHENSIVE SUMMARY
            const Department = require('../../models/departments.model');
            const Task = require('../../models/task.model');

            const [
                sales,
                txs,
                stocks,
                projects,
                employees,
                departments,
                tasks,
                leads,
                purchaseOrders
            ] = await Promise.all([
                Sales.find({ businessId }).sort({ createdAt: -1 }).limit(50),
                Transaction.find({ businessId }).sort({ transactionDate: -1 }).limit(50),
                Stock.find({ businessId }).populate('itemId'),
                Project.find({ businessId }).populate('clientId', 'name organizationName'),
                User.find({ businessId, "role.name": "EMPLOYEE" }).populate('departmentId', 'name'),
                Department.find({ businessId }).populate('managerId', 'name'),
                Task.find({ businessId }).populate('assignedTo assignedBy', 'name').sort({ createdAt: -1 }).limit(30),
                Lead.find({ businessId }),
                PurchaseOrder.find({ businessId })
            ]);

            const validStocks = stocks.filter(s => s.itemId);

            // Calculate comprehensive metrics
            const totalRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            const paidRevenue = sales.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            const totalStockValue = validStocks.reduce((sum, s) => {
                const cost = s.itemId.pricing?.costPrice || 0;
                return sum + (s.quantity * cost);
            }, 0);
            const totalExpenses = txs.filter(t => t.entries.some(e => e.debit > 0))
                .reduce((sum, t) => sum + t.entries.reduce((s, e) => s + (e.debit || 0), 0), 0);

            data.summary = {
                "Total Revenue": `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Paid Revenue": `₹${paidRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Total Expenses": `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Net Profit": `₹${(paidRevenue - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Inventory Value": `₹${totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Total Projects": projects.length,
                "Active Projects": projects.filter(p => p.status === 'IN_PROGRESS').length,
                "Total Employees": employees.length,
                "Active Employees": employees.filter(e => e.status === 'ACTIVE').length,
                "Total Tasks": tasks.length,
                "Pending Tasks": tasks.filter(t => t.status === 'PENDING').length,
                "Total Leads": leads.length,
                "Won Leads": leads.filter(l => l.status === 'WON').length
            };

            data.sections = {
                sales: sales.slice(0, 15).map(s => ({
                    date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A',
                    invoice: s.invoiceNumber,
                    amount: `₹${(s.grandTotal || 0).toLocaleString('en-IN')}`,
                    status: s.status
                })),
                projects: projects.slice(0, 15).map(p => ({
                    name: p.name,
                    client: p.clientId?.organizationName || p.clientId?.name || 'Internal',
                    status: p.status,
                    budget: p.budget?.estimated ? `₹${p.budget.estimated.toLocaleString('en-IN')}` : 'N/A'
                })),
                tasks: tasks.slice(0, 15).map(t => ({
                    title: t.title,
                    assignedTo: t.assignedTo?.name || 'Unassigned',
                    priority: t.priority,
                    status: t.status
                })),
                inventory: validStocks.slice(0, 15).map(s => ({
                    item: s.itemId.name,
                    stock: s.quantity,
                    value: `₹${(s.quantity * (s.itemId.pricing?.costPrice || 0)).toLocaleString('en-IN')}`,
                    status: s.quantity <= (s.reorderLevel || 10) ? 'Low Stock' : 'Adequate'
                }))
            };
        }

        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Fetch Report Data Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch report data" });
    }
};

// Generate a dynamic report (AI Powered)
const handleGenerateReport = async (req, res) => {

    let business = null;
    let data = {
        generatedAt: new Date().toLocaleDateString(),
        type: req.body.type || 'SUMMARY',
        filters: req.body.filters || {}
    };

    try {

        const businessId = req.user.businessId._id;
        const { type = 'SUMMARY', filters = {} } = req.body;

        // 1. Fetch Business Details for Header
        business = await Business.findById(businessId).select('companyName address email phone');

        // Helper to format address
        const formatAddr = (addr) => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            return [addr.addressLine, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ');
        };

        const formattedAddress = formatAddr(business?.address);

        // 2. Data Gathering based on Type
        if (type === 'SALES') {
            const query = { businessId };
            if (filters.fromDate || filters.toDate) {
                query.createdAt = {};
                if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
                if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
            }
            const sales = await Sales.find(query).populate('customerId', 'organizationName contact').sort({ createdAt: -1 });

            data.summary = {
                "Total Count": sales.length,
                "Total Revenue": `₹${sales.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Pending Revenue": `₹${sales.filter(s => s.status !== 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            };

            data.rows = sales.slice(0, 50).map(s => ({

                DueDate: new Date(s.dueDate).toLocaleDateString(),
                Invoice: s.invoiceNumber,
                Customer: s.customerId?.organizationName || s.customerId?.contact?.name || 'Guest',
                Amount: `₹${(s.grandTotal || 0).toLocaleString('en-IN')}`,
                Status: s.status
            }));


        } else if (type === 'FINANCE') {
            const query = { businessId };
            if (filters.fromDate || filters.toDate) {
                query.transactionDate = {};
                if (filters.fromDate) query.transactionDate.$gte = new Date(filters.fromDate);
                if (filters.toDate) query.transactionDate.$lte = new Date(filters.toDate);
            }
            const txs = await Transaction.find(query).populate('entries.accountId', 'name').sort({ transactionDate: -1 });
            const expenses = txs.filter(t => t.entries.some(e => e.debit > 0));

            data.summary = {
                "Total Transactions": txs.length,
                "Total Expenses": `₹${expenses.reduce((sum, t) => sum + t.entries.reduce((s, e) => s + (e.debit || 0), 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            };
            data.rows = txs.slice(0, 50).map(t => ({
                Date: t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : 'N/A',
                Description: t.description,
                Category: t.category,
                Amount: `₹${t.entries.reduce((s, e) => s + (e.debit || e.credit || 0), 0).toLocaleString('en-IN')}`,
                Ref: t.referenceNumber || '-'
            }));

        } else if (type === 'INVENTORY') {
            // Fetch STOCK because INVENTORY (Item Master) doesn't have quantity
            const stocks = await Stock.find({ businessId }).populate('itemId');

            // Filter out any stocks where itemId is missing (e.g. deleted inventory)
            const validStocks = stocks.filter(s => s.itemId);

            const totalValue = validStocks.reduce((sum, s) => {
                const cost = s.itemId.pricing?.costPrice || 0;
                return sum + (s.quantity * cost);
            }, 0);

            data.summary = {
                "Total Items": validStocks.length,
                "Total Stock Value": `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            };

            data.rows = validStocks.slice(0, 50).map(s => ({
                Item: s.itemId.name,
                SKU: s.itemId.sku || '-',
                Stock: s.quantity,
                "Cost Price": `₹${(s.itemId.pricing?.costPrice || 0).toLocaleString('en-IN')}`,
                "Selling Price": `₹${(s.itemId.pricing?.sellingPrice || 0).toLocaleString('en-IN')}`,
                Category: s.itemId.category || '-'
            }));

        } else if (type === 'PROJECT') {
            const query = { businessId };
            if (filters.status) query.status = filters.status;

            const projects = await Project.find(query).populate('clientId', 'name organizationName').sort({ createdAt: -1 });
            const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;

            data.summary = {
                "Total Projects": projects.length,
                "Active Projects": activeProjects,
                "Completed Projects": projects.filter(p => p.status === 'COMPLETED').length
            };
            data.rows = projects.slice(0, 50).map(p => ({
                "Project Name": p.name,
                Client: p.clientId?.organizationName || p.clientId?.name || 'Internal',
                Status: p.status,
                Deadline: p.endDate ? new Date(p.endDate).toLocaleDateString() : 'No Deadline',
                Budget: p.budget?.estimated ? `₹${p.budget.estimated.toLocaleString('en-IN')}` : '-'
            }));

        } else if (type === 'EMPLOYEE') {
            // Fetch Employees
            const employees = await User.find({ businessId, "role.name": "EMPLOYEE" })
                .populate('departmentId', 'name')
                .select('name email role departmentId status dateOfJoining');

            // Check for Active Leaves (Approved & Today is within range)
            const today = new Date();
            const activeLeaves = await Leave.find({
                businessId,
                status: 'APPROVED',
                startDate: { $lte: today },
                endDate: { $gte: today }
            }).select('employeeId');

            const onLeaveIds = new Set(activeLeaves.map(l => l.employeeId.toString()));

            data.summary = {
                "Total Employees": employees.length,
                "Active": employees.filter(e => e.status === 'ACTIVE').length,
                "On Leave": onLeaveIds.size
            };

            data.rows = employees.slice(0, 50).map(e => ({
                Name: e.name,
                Role: e.role?.name || e.role,
                Department: e.departmentId?.name || '-',
                Status: onLeaveIds.has(e._id.toString()) ? 'ON LEAVE' : e.status,
                "Joined On": e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString() : '-'
            }));

        } else {
            // COMPREHENSIVE BUSINESS SUMMARY - All Modules Data
            const Department = require('../../models/departments.model');
            const Task = require('../../models/task.model');

            const [
                sales,
                txs,
                stocks,
                projects,
                employees,
                departments,
                tasks,
                leads,
                purchaseOrders,
                attendance,
                payrolls
            ] = await Promise.all([
                Sales.find({ businessId }).sort({ createdAt: -1 }).limit(20),
                Transaction.find({ businessId }).sort({ transactionDate: -1 }).limit(20),
                Stock.find({ businessId }).populate('itemId'),
                Project.find({ businessId }).populate('clientId', 'name organizationName'),
                User.find({ businessId, "role.name": "EMPLOYEE" }).populate('departmentId', 'name'),
                Department.find({ businessId }).populate('managerId', 'name'),
                Task.find({ businessId }).populate('assignedTo assignedBy', 'name').sort({ createdAt: -1 }).limit(15),
                Lead.find({ businessId }),
                PurchaseOrder.find({ businessId }),
                Attendance.find({ businessId }).sort({ date: -1 }).limit(10),
                Payroll.find({ businessId }).sort({ createdAt: -1 }).limit(5)
            ]);

            // Calculate comprehensive metrics
            const validStocks = stocks.filter(s => s.itemId);

            // Financial Metrics
            const totalRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            const paidRevenue = sales.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0);
            const pendingRevenue = sales.filter(s => s.status !== 'PAID').reduce((sum, s) => sum + (s.grandTotal || 0), 0);

            const totalStockValue = validStocks.reduce((sum, s) => {
                const cost = s.itemId.pricing?.costPrice || 0;
                return sum + (s.quantity * cost);
            }, 0);

            const totalExpenses = txs
                .filter(t => t.entries.some(e => e.debit > 0))
                .reduce((sum, t) => sum + t.entries.reduce((s, e) => s + (e.debit || 0), 0), 0);

            // Project Metrics
            const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;
            const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
            const totalProjectBudget = projects.reduce((sum, p) => sum + (p.budget?.estimated || 0), 0);

            // Employee & HR Metrics
            const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
            const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netPayable || 0), 0);

            // Task Metrics
            const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
            const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
            const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
            const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length;

            // CRM Metrics
            const wonLeads = leads.filter(l => l.status === 'WON').length;
            const activeLeads = leads.filter(l => l.status === 'CONTACTED' || l.status === 'QUALIFIED').length;
            const conversionRate = leads.length ? ((wonLeads / leads.length) * 100).toFixed(1) : 0;

            // Procurement Metrics
            const totalProcurement = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
            const pendingPOs = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'APPROVED').length;

            // Inventory Metrics
            const lowStockItems = validStocks.filter(s => s.quantity <= (s.reorderLevel || 10)).length;

            data.summary = {
                // Financial Overview
                "Total Revenue": `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Paid Revenue": `₹${paidRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Pending Revenue": `₹${pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Total Expenses": `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Net Profit": `₹${(paidRevenue - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Inventory Value": `₹${totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                "Net Valuation": `₹${(paidRevenue - totalExpenses + totalStockValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,

                // Project Metrics
                "Total Projects": projects.length,
                "Active Projects": activeProjects,
                "Completed Projects": completedProjects,
                "Project Budget": `₹${totalProjectBudget.toLocaleString('en-IN')}`,

                // HR & Employee Metrics
                "Total Employees": employees.length,
                "Active Employees": activeEmployees,
                "Total Departments": departments.length,
                "Recent Payroll": `₹${totalPayroll.toLocaleString('en-IN')}`,

                // Task Management
                "Total Tasks": tasks.length,
                "Pending Tasks": pendingTasks,
                "In Progress Tasks": inProgressTasks,
                "Completed Tasks": completedTasks,
                "High Priority Tasks": highPriorityTasks,

                // CRM & Sales
                "Total Leads": leads.length,
                "Active Leads": activeLeads,
                "Won Leads": wonLeads,
                "Conversion Rate": `${conversionRate}%`,

                // Procurement & Inventory
                "Total Procurement": `₹${totalProcurement.toLocaleString('en-IN')}`,
                "Pending Purchase Orders": pendingPOs,
                "Inventory Items": validStocks.length,
                "Low Stock Items": lowStockItems
            };

            // Detailed sections for comprehensive report
            data.sections = {
                departments: departments.map(d => ({
                    name: d.name,
                    manager: d.managerId?.name || 'Not Assigned',
                    employees: d.totalEmployees || 0,
                    status: d.status
                })),

                recentTasks: tasks.slice(0, 10).map(t => ({
                    title: t.title,
                    assignedTo: t.assignedTo?.name || 'Unassigned',
                    priority: t.priority,
                    status: t.status,
                    dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline'
                })),

                projectOverview: projects.slice(0, 10).map(p => ({
                    name: p.name,
                    client: p.clientId?.organizationName || p.clientId?.name || 'Internal',
                    status: p.status,
                    budget: p.budget?.estimated ? `₹${p.budget.estimated.toLocaleString('en-IN')}` : 'N/A'
                })),

                inventoryStatus: validStocks.slice(0, 15).map(s => ({
                    item: s.itemId.name,
                    stock: s.quantity,
                    value: `₹${(s.quantity * (s.itemId.pricing?.costPrice || 0)).toLocaleString('en-IN')}`,
                    status: s.quantity <= (s.reorderLevel || 10) ? 'Low Stock' : 'Adequate'
                })),

                recentSales: sales.slice(0, 10).map(s => ({
                    date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A',
                    invoice: s.invoiceNumber,
                    amount: `₹${(s.grandTotal || 0).toLocaleString('en-IN')}`,
                    status: s.status
                }))
            };

            data.rows = []; // Not used for summary, data is in sections
        }

        // 3. Construct Prompt for AI to generate ONLY the main content
        const prompt = getPrompt(type, data)

        // 4. Generate Content from AI
        const aiResponse = await getAiResponse(prompt)

        const aiGeneratedContent = aiResponse?.candidates[0]?.content?.parts[0]?.text || '';

        // 5. Insert AI content into fixed HTML template
        const currentYear = new Date().getFullYear();
        const reportPeriod = filters.fromDate && filters.toDate
            ? `${new Date(filters.fromDate).toLocaleDateString()} - ${new Date(filters.toDate).toLocaleDateString()}`
            : 'All Time';


        const htmlData = {
            type: type,
            companyName: business?.companyName,
            email: business?.email,
            phone: business?.phone,
            content: aiGeneratedContent,
            address: formattedAddress,
            currentYear: currentYear,
            reportPeriod: reportPeriod,
            generatedAt: data?.generatedAt
        }
        
        const finalHTML = getHtmlReport(htmlData)
        
        res.status(200).json({ success: true, data: finalHTML });

    } catch (error) {
        console.error("AI Report Error:", error);

        // Fallback Mechanism: Generate standard HTML if AI fails
        const fallbackHTML = generateFallbackHTML(data, business);
        return res.status(200).json({
            success: true,
            data: fallbackHTML,
            isFallback: true,
            message: "Report generated using standard template (AI unavailable)"
        });
    }
};

// Helper: Generate a clean HTML report without AI
const generateFallbackHTML = (data, business) => {
    const { type, generatedAt, summary, rows, filters } = data;
    const companyName = business?.companyName || 'Company Name';

    // Format address if it's an object
    let address = business?.address || '';
    if (address && typeof address === 'object') {
        address = [address.addressLine, address.city, address.state, address.pincode, address.country]
            .filter(Boolean)
            .join(', ');
    }

    // Create Summary Cards HTML
    const summaryHTML = Object.entries(summary || {}).map(([key, val]) => `
        <div class="card">
            <div class="card-label">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
            <div class="card-value">${val}</div>
        </div>
    `).join('');

    // Create Table Rows HTML
    const tableRowsHTML = (rows || []).map(row => `
        <tr>
            ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
        </tr>
    `).join('');

    // Get table headers dynamically from the first row key
    const headers = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
    const tableHeadersHTML = headers.map(h => `<th>${h.toUpperCase()}</th>`).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
            .header-table { width: 100%; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .company { font-size: 24px; font-weight: bold; color: #1e40af; }
            .meta { text-align: right; font-size: 12px; color: #666; }
            .title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; }
            
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
            .card-label { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; }
            .card-value { font-size: 18px; font-weight: bold; color: #0f172a; }

            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; padding: 12px; background: #eef2ff; color: #1e3a8a; font-weight: bold; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f9fafb; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            
            @media print {
                body { padding: 0; }
                .summary-grid { grid-template-columns: repeat(3, 1fr); }
            }
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td>
                    <div class="company">${companyName}</div>
                    <div style="font-size: 12px; margin-top: 4px;">${address}</div>
                </td>
                <td class="meta">
                    <div>Generated: ${generatedAt}</div>
                    <div>Type: ${type}</div>
                    <div>${filters ? JSON.stringify(filters).replace(/"/g, ' ').replace(/[{}]/g, '') : ''}</div>
                </td>
            </tr>
        </table>

        <div class="title">${type} REPORT</div>

        <div class="summary-grid">
            ${summaryHTML}
        </div>

        <table>
            <thead>
                <tr>${tableHeadersHTML}</tr>
            </thead>
            <tbody>
                ${tableRowsHTML}
            </tbody>
        </table>

        <div class="footer">
            Generated by ERP System • All Rights Reserved
        </div>
    </body>
    </html>
    `;
};

// Generate PDF for a report type
const handleGenerateReportPDF = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { type = 'SUMMARY', filters = {} } = req.body;

        // reuse JSON generator
        const fakeReq = { user: req.user, body: { type, filters } };
        // call handleGenerateReport logic inline to avoid circular
        let reportData;
        // quick inline copy of generation for PDF (only key metrics)
        if (type === 'SALES') {
            const sales = await Sales.find({ businessId }).populate('customerId', 'organizationName contact');
            reportData = { rows: sales, summary: { totalCount: sales.length, totalRevenue: sales.filter(s => s.status === 'PAID').reduce((a, b) => a + (b.grandTotal || 0), 0) } };
        } else if (type === 'FINANCE') {
            const txs = await Transaction.find({ businessId }).populate('entries.accountId', 'name code');
            reportData = { rows: txs, summary: { creditTotal: txs.reduce((t, tx) => t + (tx.entries?.reduce((s, e) => s + (e.credit || 0), 0) || 0), 0), debitTotal: txs.reduce((t, tx) => t + (tx.entries?.reduce((s, e) => s + (e.debit || 0), 0) || 0), 0) } };
        } else if (type === 'PROJECT') {
            const projects = await Project.find({ businessId }).populate('members.user', 'name');
            reportData = { rows: projects, summary: { totalProjects: projects.length } };
        } else if (type === 'EMPLOYEE') {
            const attendance = await Attendance.find({ businessId }).populate('employeeId', 'name');
            reportData = { rows: attendance, summary: { records: attendance.length, totalWorkMinutes: attendance.reduce((s, a) => s + (a.totalWorkMinutes || 0), 0) } };
        } else {
            const [sales, pos, txs] = await Promise.all([Sales.find({ businessId }), PurchaseOrder.find({ businessId }), Transaction.find({ businessId })]);
            reportData = { summary: { sales: sales.length, procurement: pos.length, finance: txs.length } };
        }

        const business = await Business.findById(businessId);

        // generate PDF
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type.toLowerCase()}-report.pdf`);

        // Pipe to response
        doc.pipe(res);

        // Header / Company Info
        doc.fontSize(16).text(business?.companyName || 'Company', { align: 'left' });
        if (business?.address) doc.fontSize(10).text(business.address, { align: 'left' });
        doc.moveDown();

        doc.fontSize(14).text(`${type} Report`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        // Summary
        doc.fontSize(12).text('Summary', { underline: true });
        doc.moveDown(0.25);
        doc.fontSize(10).text(JSON.stringify(reportData.summary, null, 2));
        doc.moveDown();

        // Rows — limited preview
        doc.fontSize(12).text('Details (preview)', { underline: true });
        doc.moveDown(0.25);
        const rows = reportData.rows || [];
        const preview = rows.slice(0, 50).map((r, idx) => `${idx + 1}. ${r._id ? r._id.toString() : (r.invoiceNumber || r.referenceNumber || r.name || 'row')}`);
        preview.forEach(line => doc.fontSize(9).text(line));

        // Footer
        doc.moveDown(2);
        doc.fontSize(9).text(business?.companyName || '', { align: 'center' });
        doc.fontSize(8).text(`Report generated by ${req.user?.name || 'System'}`, { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('PDF generation error', error);
        res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
};

// Save generated report
const handleSaveReport = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { name, type = 'CUSTOM', filters = {}, content } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Report name required' });
        const report = await Report.create({ businessId, name, type, filters, content, createdBy: req.user._id });
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error('Save report error', error);
        res.status(500).json({ success: false, message: 'Error saving report' });
    }
};

// Get saved reports with filtering
const handleGetSavedReports = async (req, res) => {
    try {
        const businessId = req.user.businessId._id;
        const { type } = req.query;

        const query = { businessId };
        if (type && type !== 'ALL') {
            query.type = type;
        }

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .select('name type filters createdAt')
            .limit(50);

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        console.error('Get saved reports error', error);
        res.status(500).json({ success: false, message: 'Error fetching saved reports' });
    }
};

// Start: Delete Report
const handleDeleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;

        const report = await Report.findOneAndDelete({ _id: id, businessId });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.status(200).json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        console.error("Delete report error:", error);
        res.status(500).json({ success: false, message: "Error deleting report" });
    }
};

// Fetch single report content (for viewing)
const handleGetReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.businessId._id;
        const report = await Report.findOne({ _id: id, businessId });
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error("Fetch report error:", error);
        res.status(500).json({ success: false, message: "Error fetching report" });
    }
}

module.exports = {
    handleGetReportSummary,
    handleFetchReportData,
    handleGenerateReport,
    handleGenerateReportPDF,
    handleSaveReport,
    handleGetSavedReports,
    handleDeleteReport,
    handleGetReportById
};
