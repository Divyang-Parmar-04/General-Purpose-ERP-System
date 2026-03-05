

const employeeRoleMiddleware = async (req, res, next) => {
    try {
        if (req.roleName !== "EMPLOYEE") {
            return res.status(403).json({
                error: true,
                message: "Forbidden"
            });
        }

        req.user = req.user;
        req.roleName = req.user.role.name;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({
            error: true,
            message: "Invalid or expired token"
        });
    }
};


module.exports = { employeeRoleMiddleware }
