const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

//MongoDB connet
connectDB()

//Middleware
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true
}));


// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const fs = require("fs");
if (!fs.existsSync("./public/temp")) {
  fs.mkdirSync("./public/temp", { recursive: true });
}

// Auth Routes : 
const authRoutes = require("./routes/auth/auth.route")

app.use("/api/auth", authRoutes)

// ADMIN ROUTERS : 
const businessRoutes = require("./routes/admin/business.route")
const modulesRoutes = require("./routes/admin/modules.route")
const taskRoutes = require("./routes/admin/task.route")
const projectRoutes = require("./routes/admin/project.route")
const hrRoutes = require("./routes/admin/hr.route")
const crmRoutes = require("./routes/admin/crm.route")
const salesRoutes = require("./routes/admin/sales.route")
const procurementRoutes = require("./routes/admin/procurement.route")
const inventoryRoutes = require("./routes/admin/inventory.route")
const documentRoutes = require("./routes/admin/document.route")
const financeRoutes = require("./routes/admin/finance.route")
const accountingRoutes = require("./routes/admin/accounting.route")
const taxationRoutes = require("./routes/admin/taxation.route")
const reportsRoutes = require("./routes/admin/reports.route")
const dashboardRoutes = require("./routes/admin/dashboard.route")
const announcementRoutes = require("./routes/admin/announcement.route");
const payrollRoutes = require("./routes/admin/payroll.route");

// EMPLOYEE ROUTERS : 
const employeeDashboardRoutes = require("./routes/employee/dashboard.route")
const employeMyTaskRoutes = require("./routes/employee/myTask.route")
const employeeHrRoutes = require('./routes/employee/hr.route')
const employeeAnnouncementRoutes = require("./routes/employee/announcement.route")
const employeeProcurementRoutes = require("./routes/employee/procurement.route");
const employeeInventoryRoutes = require("./routes/employee/inventory.route");
const employeeDocumentRoutes = require("./routes/employee/document.route");
const notificationRoutes = require("./routes/common/notification.route");
const employeePayrollRoutes = require("./routes/employee/payroll.route");


// ADMIN ROUTES : 
app.use("/api/admin", businessRoutes)
app.use("/api/admin/hr", hrRoutes)
app.use("/api/admin/crm", crmRoutes)
app.use("/api/admin/tasks", taskRoutes)
app.use("/api/admin/sales", salesRoutes)
app.use("/api/admin/modules", modulesRoutes)
app.use("/api/admin/projects", projectRoutes)
app.use("/api/admin/announcement", announcementRoutes);
app.use("/api/admin/procurement", procurementRoutes)
app.use("/api/admin/inventory", inventoryRoutes)
app.use("/api/admin/documents", documentRoutes)
app.use("/api/admin/finance", financeRoutes)
app.use("/api/admin/accounting", accountingRoutes)
app.use("/api/admin/taxation", taxationRoutes)
app.use("/api/admin/reports", reportsRoutes)
app.use("/api/admin/payroll", payrollRoutes);
app.use("/api/admin", dashboardRoutes)

// EMPLOYEE ROUTES : 

app.use("/api/employee", employeeDashboardRoutes)
app.use("/api/employee", employeMyTaskRoutes)
app.use("/api/employee", employeeHrRoutes)
app.use("/api/employee/announcements", employeeAnnouncementRoutes)
app.use("/api/employee/documents", employeeDocumentRoutes);
app.use("/api/employee/procurement", employeeProcurementRoutes);
app.use("/api/employee/inventory", employeeInventoryRoutes);
app.use("/api/employee/payroll", employeePayrollRoutes);
app.use("/api/notifications", notificationRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Server is Started ");
});

const http = require("http");
const { initSocket } = require("./utils/socket");

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

