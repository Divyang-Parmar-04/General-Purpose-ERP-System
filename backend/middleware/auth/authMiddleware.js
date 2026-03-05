const jwt = require("jsonwebtoken");

const User = require("../../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    
    const token = req.cookies?.auth_token;
    

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .populate("businessId");

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid session"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        error: true,
        message: "User is not active"
      });
    }

    // Attach user to request
    req.user = user;
    req.roleName = user.role?.name;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      error: true,
      message: "Invalid or expired token"
    });
  }
};

module.exports = {authMiddleware}
