
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

        if (req.cookies?.auth_token) {

            res.clearCookie("auth_token", {
                httpOnly: true,
                secure: isProduction,   // true only in production
                sameSite: isProduction ? "none" : "lax"
            });
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

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProduction,   // true only in production
            sameSite: isProduction ? "none" : "lax"
        });


        res.json({
            success: true,
            message: "account created successful",
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


        if (req.cookies?.auth_token) {
            res.clearCookie("auth_token", {
                httpOnly: true,
                secure: isProduction,   // true only in production
                sameSite: isProduction ? "none" : "lax"
            });
        }


        // 1 Find user
        let user = await User.findOne({ email: email })

        if (user?.role?.name === "ADMIN") {
            user = await user.populate("businessId")
        }

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // 2. Password check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: true, message: "Invalid credentials" });
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

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProduction,   // true only in production
            sameSite: isProduction ? "none" : "lax"
        });


        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user?._id,
                phone: user?.phone,
                name: user?.name,
                email: user?.email,
                role: user?.role,
                businessId: user?.businessId,
                status: user?.status,
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
        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: isProduction,   // true only in production
            sameSite: isProduction ? "none" : "lax"
        });

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
            user = await User.findById(req.user._id)
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
                status: user?.status,
                modules: user?.role?.modules || [],
                permissions: user?.role?.permissions || []

            }
        });
    } catch (error) {

        console.error("Get Current User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
}


module.exports = { handleVerifyOTP, handleSendOTPForPasswordChange, handleUpdatePasssword, handleSingupUser, handleLoginUser, handleVerifyOTPAndSignup, handleLogoutUser, handleFetchUserData }