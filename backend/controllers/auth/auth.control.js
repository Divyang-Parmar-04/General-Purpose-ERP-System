
const bcrypt = require("bcryptjs");

// //Models
const User = require("../../models/user.model.js");
const Otp = require("../../models/otp.model.js");

const sendMail = require("../../utils/nodemailer.util.js");
const generateToken = require("../../utils/jwt.util.js")
const dotenv = require("dotenv")
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";


// SIGNUP USER : 
const handleSingupUser = async (req, res) => {
    try {
        const { email } = req.body

        const isuser = await User.findOne({ email });

        if (isuser) {
            return res.status(400).json({ error: true, message: "User Already exist" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ email });

        await Otp.create({
            email,
            otp,
            purpose: "USER_SIGNUP",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        // 5. Send email
        await sendMail({
            to: email,
            action: "LOGIN_OTP",
            data: {
                otp,
                expiry: "5"
            }
        });

        res.json({
            success: true,
            message: "OTP sent successfully"
        });


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "SIGNUP failed"
        });
    }
}

const handleVerifyOTPAndSignup = async (req, res) => {
    try {
        const { name, email, phone, otp, password, role, description } = req.body;

        const isuser = await User.findOne({ email });

        if (isuser) {
            return res.status(400).json({ error: true, message: "User Already exist" });
        }

        // 1. Validate OTP
        const otpDoc = await Otp.findOne({ email, otp });

        if (!otpDoc || otpDoc.expiresAt < new Date()) {
            return res.status(400).json({ error: true, message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            status: "ACTIVE",
            role: {
                name: role,
                description: description,
                isSystemRole: true,
            }
        })

        const user = await User.findOne({ email }).populate("businessId")

        //  Generate token
        const token = generateToken(
            {
                userId: user._id,
                role: user.role.name,
                businessId: user?.businessId
            },
            "1d"
        );

        res.json({
            success: true,
            message: "account created successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bussinessId: user?.businessId,
                status: user.status,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};

const handleLoginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // 1 Find user
        let user = await User.findOne({ email: email })

        if (user?.status === "SUSPEND") {
            return res.status(400).json({ error: true, message: "Your account is Suspended" });
        }

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // 2. Password check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: true, message: "Invalid credentials" });
        }

        if (user?.role?.name === "ADMIN") {
            user = await user.populate("businessId")
        }
        else {
            user = await user.populate('managerId')
        }

        //  Generate token
        const token = generateToken(
            {
                userId: user._id,
                role: user.role.name,
                businessId: user?.businessId
            },
            "1d"
        );

        await User.findByIdAndUpdate(user._id, {
            status: "ACTIVE"
        })

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user?._id,
                phone: user?.phone,
                name: user?.name,
                email: user?.email,
                managerId: user?.managerId,
                role: user?.role,
                businessId: user?.businessId,
                status: "ACTIVE",
                modules: user?.role?.modules || [],
                permissions: user?.role?.permissions || []
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};

const handleLogoutUser = async (req, res) => {
    try {
       
        await User.findByIdAndUpdate(req?.user?._id, {
            status: "INACTIVE"
        })

        return res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};

// Forgor Password

const handleSendOTPForPasswordChange = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: true, message: "User Not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.deleteMany({ email });

        await Otp.create({
            email,
            otp,
            purpose: "PASSWORD_RESET",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        // 5. Send email
        await sendMail({
            to: email,
            action: "PASSWORD_RESET",
            data: {
                otp,
                expiry: "5"
            }
        });

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Password Update failed"
        });
    }
}

const handleVerifyOTP = async (req, res) => {
    try {
        // 1. Validate OTP
        const { email, otp } = req.body

        const otpDoc = await Otp.findOne({ email, otp });

        if (!otpDoc || otpDoc.expiresAt < new Date()) {
            return res.status(400).json({ error: true, message: "Invalid or expired OTP" });
        }

        return res.json({
            success: true,
            message: "OTP Veified successfully "
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Password Update failed"
        });
    }
}

const handleUpdatePasssword = async (req, res) => {

    try {
        const { password, email, } = req.body

        const user = await User.findOne({ email });

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword

        await user.save()

        return res.json({
            success: true,
            message: "Password Updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Password Update failed"
        });
    }
}

const handleFetchUserData = async (req, res) => {

    try {

        let user = {}

        if (req.user.role.name === "ADMIN") {
            user = await User.findById(req.user._id).populate("businessId")
        }
        else {
            user = await User.findById(req.user._id).populate('managerId')
        }

        return res.json({
            success: true,
            user: {
                id: user?._id,
                phone: user?.phone,
                name: user?.name,
                email: user?.email,
                role: user?.role,
                businessId: user?.businessId,
                managerId: user?.managerId,
                status: user?.status,
                modules: user?.role?.modules || [],
                permissions: user?.role?.permissions || []
            }
        });
    } catch (error) {

        console.error("Get Current User Error:", error);
        return res.status(500).json({
            success: false,
        });
    }
}

const handleUpdateAdminProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { email, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure only ADMIN can perform this 
        if (user.role.name !== "ADMIN" && user.role.name !== "SUPER_ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Access restricted to admins only"
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
            user.email = email;
        }

        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Update Admin Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile"
        });
    }
}


module.exports = { handleVerifyOTP, handleSendOTPForPasswordChange, handleUpdatePasssword, handleSingupUser, handleLoginUser, handleVerifyOTPAndSignup, handleLogoutUser, handleFetchUserData, handleUpdateAdminProfile }