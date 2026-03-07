
import api from "../../service/api";

//sending new Registration Request
const sendOTPRequestAPI = async (data) => {
  try {
    const response = await api.post("/api/auth/user/signup", data);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message:
        error.response?.data?.message ||
        "Something went wrong, please try again",
    };
  }
};

//sending OTP for verification
const sendSignupRequestAPI = async (data) => {
  try {
    const response = await api.post("/api/auth/user/verify-otp", data)
    return response.data
  } catch (error) {
    return { error: true, message: error.response?.data?.message || "Something went wrong, please try again", }
  }
}

//login
const sendLoginRequestAPI = async (data) => {
  try {
    const response = await api.post("/api/auth/user/login", data)
    // console.log(response)
    return response.data
  } catch (error) {
    console.log(error)
    return { error: true, message: error.response?.data?.message || "Something went wrong, please try again", }
  }
}

const sendLogoutRequestAPI = async () => {
  try {
    const response = await api.get("/api/auth/user/logout")
    return response.data
  } catch (error) {
    console.log(error)
    return { error: true, message: error.response?.data?.message || "Something went wrong, please try again", }
  }
}

// Get Current User Info
const fetchCurrentUserAPI = async () => {
  try {
    const res = await api.get("/api/auth/me");
    return res.data;
  } catch (err) {
    console.log(err)
    return null;
  }
};


// Password Reset : 

const sendOTPRequest = async (data) => {
  try {
    const res = await api.post("/api/auth/user/send-otp", data);
    return res.data;
  } catch (err) {
    console.log(err)
    return null;
  }
}

const sendVerifyOTP = async (data) => {
  try {
    const res = await api.post("/api/auth/user/password/verify-otp", data);
    return res.data;
  } catch (err) {
    console.log(err)
    return null;
  }
}

const sendNewPassword = async (data) => {
  try {
    const res = await api.post("/api/auth/user/password/update", data);
    return res.data;
  } catch (err) {
    console.log(err)
    return null;
  }
}

const updateAdminProfileAPI = async (data) => {
  try {
    const res = await api.put("/api/auth/user/profile/admin", data);
    return res.data;
  } catch (err) {
    console.log(err)
    return null;
  }
}

export { sendOTPRequestAPI, sendLoginRequestAPI, fetchCurrentUserAPI, sendLogoutRequestAPI, sendSignupRequestAPI, sendOTPRequest, sendVerifyOTP, sendNewPassword, updateAdminProfileAPI }