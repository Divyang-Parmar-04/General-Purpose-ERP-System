

const userRoleMiddleware = async (req, res, next) => {

    try {

        if (req.roleName !== "ADMIN") {
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


module.exports = { userRoleMiddleware }
