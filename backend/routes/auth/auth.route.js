const express = require("express");
const { handleSingupUser, handleVerifyOTPAndSignup, handleLoginUser, handleFetchUserData, handleLogoutUser, handleSendOTPForPasswordChange, handleUpdatePasssword, handleVerifyOTP } = require("../../controllers/auth/auth.control");

const { authMiddleware } = require("../../middleware/auth/authMiddleware");

const { handleUpdateUserProfile, handleUpdateEmployee } = require("../../controllers/admin/user.control");


const router = express.Router()

//Signup :

router.post("/user/signup", handleSingupUser)

router.post("/user/verify-otp", handleVerifyOTPAndSignup)

//Login : 

router.post("/user/login", handleLoginUser)

//Logout : 

router.get('/user/logout', handleLogoutUser)

//Updated Password : 

router.post("/user/send-otp", handleSendOTPForPasswordChange)

router.post("/user/password/verify-otp" , handleVerifyOTP)

router.post("/user/password/update" , handleUpdatePasssword)


// Fetch Data : 


router.put("/user/profile", authMiddleware, handleUpdateUserProfile);

router.get("/me", authMiddleware, handleFetchUserData)


module.exports = router