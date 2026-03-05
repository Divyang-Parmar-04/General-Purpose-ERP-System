
const User = require('../../models/user.model');
const Department = require('../../models/departments.model');
const Task = require('../../models/task.model');
const Lead = require('../../models/crm.model');
const Sales = require('../../models/sales.model');
const { Inventory } = require('../../models/inventory.model');
const { Stock } = require('../../models/inventory.model');
const { Transaction } = require('../../models/finance.model');
const Project = require('../../models/project.model');
const { PurchaseOrder } = require('../../models/procurement.model'); // adjust if needed
const { Vendor } = require('../../models/procurement.model');

// Helper to get start of month dates for the last 6–12 months
const getLastMonths = (months = 6) => {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dates.push({
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
      label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
    });
  }
  return dates.reverse(); // oldest to newest
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const businessId = req.user.businessId._id;
    const modules = req.user.businessId.modules || {};

    const stats = {};
    const charts = {};
    const lists = {};
    const alerts = {};

    // ────────────────────────────────────────────────
    // 1. HR / Employees / Departments
    // ────────────────────────────────────────────────
    if (modules.hr || modules.userManagement || modules.core) {
      stats.employees = await User.countDocuments({
        businessId,
        "role.name": { $ne: "ADMIN" },
        status: "ACTIVE" 
      });

      stats.departments = await Department.countDocuments({ businessId });

      // Department employee distribution for chart
      if (modules.hr) {
        const deptAgg = await User.aggregate([
          { $match: { businessId, "role.name": { $ne: "ADMIN" } } },
          { $group: { _id: "$departmentId", count: { $sum: 1 } } },
          {
            $lookup: {
              from: "departments",
              localField: "_id",
              foreignField: "_id",
              as: "dept"
            }
          },
          { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              department: { $ifNull: ["$dept.name", "Unassigned"] },
              employees: "$count"
            }
          }
        ]);

        charts.departmentEmployees = deptAgg;
      }
    }

    // ────────────────────────────────────────────────
    // 2. Tasks Module
    // ────────────────────────────────────────────────
    if (modules.tasks) {
      stats.pendingTasks = await Task.countDocuments({
        businessId,
        status: { $in: ["PENDING", "IN_PROGRESS" ,"COMPLETED"] }
      });

      // Task status breakdown for chart
      const taskStatusAgg = await Task.aggregate([
        { $match: { businessId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      charts.taskStatus = taskStatusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Recent tasks
      lists.recentTasks = await Task.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('title status project dueDate')
        .lean();
    }

    // ────────────────────────────────────────────────
    // 3. CRM / Leads
    // ────────────────────────────────────────────────
    if (modules.crm) {
      stats.leads = await Lead.countDocuments({ businessId });
      stats.newLeads = await Lead.countDocuments({ businessId, pipelineStage: "NEW" });

      // Lead status distribution
      const leadStatusAgg = await Lead.aggregate([
        { $match: { businessId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      charts.leadStatus = leadStatusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Recent leads
      lists.recentLeads = await Lead.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('contact.name organizationName status pipelineStage')
        .lean();
    }

    // ────────────────────────────────────────────────
    // 4. Sales / Revenue
    // ────────────────────────────────────────────────
    if (modules.sales) {
      // Total revenue (paid invoices)
      const revenueAgg = await Sales.aggregate([
        { $match: { businessId, status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]);
      stats.revenue = revenueAgg[0]?.total || 0;

      stats.pendingInvoices = await Sales.countDocuments({
        businessId,
        status: { $in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] }
      });

      // Revenue trend (last 6 months)
      const months = getLastMonths(6);
      const revenueTrend = [];

      for (const m of months) {
        const monthRevenue = await Sales.aggregate([
          {
            $match: {
              businessId,
              status: "PAID",
              createdAt: { $gte: m.start, $lte: m.end }
            }
          },
          { $group: { _id: null, value: { $sum: "$grandTotal" } } }
        ]);

        revenueTrend.push({
          label: m.label,
          value: monthRevenue[0]?.value || 0
        });
      }

      charts.revenueTrend = revenueTrend;
    }

    // ────────────────────────────────────────────────
    // 5. Inventory
    // ────────────────────────────────────────────────
    if (modules.inventory) {
      stats.totalProducts = await Inventory.countDocuments({ businessId, status: "ACTIVE" });

      // Low stock alerts
      const lowStockCount = await Stock.countDocuments({
        businessId,
        $expr: {
          $and: [
            { $gt: ["$reorderLevel", 0] },
            { $lte: ["$quantity", "$reorderLevel"] }
          ]
        }
      });

      stats.lowStockItems = lowStockCount;
      alerts.lowStock = lowStockCount;

      // Category distribution (if you have category field)
      const categoryAgg = await Inventory.aggregate([
        { $match: { businessId, status: "ACTIVE" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      charts.inventoryCategories = categoryAgg.reduce((acc, curr) => {
        acc[curr._id || "Uncategorized"] = curr.count;
        return acc;
      }, {});

      // Recent low stock items
      lists.lowStockItems = await Stock.find({
        businessId,
        $expr: { $lte: ["$quantity", "$reorderLevel"] }
      })
        .populate('itemId', 'name sku')
        .sort({ quantity: 1 })
        .limit(6)
        .lean();
    }

    // ────────────────────────────────────────────────
    // 6. Accounting / Finance
    // ────────────────────────────────────────────────
    if (modules.finance || modules.accounting) {
      // Total revenue already from sales, here we can add expenses if needed
      const expenseAgg = await Transaction.aggregate([
        { $match: { businessId, status: "COMPLETED" } },
        { $unwind: "$entries" },
        {
          $lookup: {
            from: "accounts",
            localField: "entries.accountId",
            foreignField: "_id",
            as: "account"
          }
        },
        { $unwind: "$account" },
        { $match: { "account.type": "EXPENSE" } },
        { $group: { _id: null, total: { $sum: "$entries.debit" } } }
      ]);

      stats.expenses = expenseAgg[0]?.total || 0;

      // Transaction trend (could be net movement or just volume)
      const months = getLastMonths(6);
      const transactionTrend = [];

      for (const m of months) {
        const count = await Transaction.countDocuments({
          businessId,
          status: "COMPLETED",
          transactionDate: { $gte: m.start, $lte: m.end }
        });
        transactionTrend.push({ label: m.label, value: count });
      }

      charts.transactionTrend = transactionTrend;

      // Recent transactions
      lists.recentTransactions = await Transaction.find({ businessId, status: "COMPLETED" })
        .sort({ transactionDate: -1 })
        .limit(6)
        .select('referenceNumber transactionType description status transactionDate')
        .lean();
    }

    // ────────────────────────────────────────────────
    // 7. Projects
    // ────────────────────────────────────────────────
    if (modules.projects) {
      stats.activeProjects = await Project.countDocuments({
        businessId,
        status: "IN_PROGRESS"
      });

      // Project status distribution
      const projectStatusAgg = await Project.aggregate([
        { $match: { businessId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      charts.projectStatus = projectStatusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Recent projects
      lists.recentProjects = await Project.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name description status priority')
        .lean();
    }

    // ────────────────────────────────────────────────
    // 8. Procurement / Vendors / POs
    // ────────────────────────────────────────────────
    if (modules.procurement) {
      stats.vendors = await Vendor.countDocuments({ businessId, status: "ACTIVE" });

      stats.purchaseOrders = await PurchaseOrder.countDocuments({
        businessId,
        status: { $nin: ["RECEIVED", "CANCELLED"] }
      });

      // PO status distribution
      const poStatusAgg = await PurchaseOrder.aggregate([
        { $match: { businessId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      charts.poStatus = poStatusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Recent POs
      lists.recentPurchaseOrders = await PurchaseOrder.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('poNumber vendorId status grandTotal expectedDeliveryDate')
        .lean();
    }

    // ────────────────────────────────────────────────
    // Final Response
    // ────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        stats,
        charts,
        lists,
        alerts,
        enabledModules: modules
      }
    });

  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getAdminDashboardStats };