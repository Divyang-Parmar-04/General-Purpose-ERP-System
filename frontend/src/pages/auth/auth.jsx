import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, Loader2, Moon, Sun, PhoneCallIcon, PhoneIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendLoginRequestAPI, sendNewPassword, sendOTPRequest, sendOTPRequestAPI, sendSignupRequestAPI, sendVerifyOTP } from '../../utils/auth/auth.util';
import { loginSuccess } from '../../store/slices/auth.slice';

const Auth = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate();


    const [isLogin, setIsLogin] = useState(true);
    const [forgotStep, setForgotStep] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin && formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        setIsLoading(true);

        try {
            if (isLogin) {

                const payload = {
                    email: formData.email,
                    password: formData.password,
                }

                const res = await sendLoginRequestAPI(payload);

                if (res.success) {
                    toast.success("Login successful!");

                    dispatch(
                        loginSuccess({
                            user: res.user,
                            role: res.user.role.name
                        })
                    );

                    localStorage.setItem('isUserLogin', "true")

                    setTimeout(() => {
                        if (res.user.role.name == "ADMIN" && !res.user.businessId) {
                            navigate("/setup")
                        }
                        else {
                            navigate(`/${(res.user.role.name).toLowerCase()}/dashboard`)
                        }

                    }, 1000)

                }
                else {
                    toast.error("Invalid Credentials")
                }

            } else {

                const res = await sendOTPRequestAPI({ email: formData.email })

                if (res.success) {
                    setIsOtpSent(true);
                    toast.success("Verification code sent to your email!");
                }
                else {
                    return toast.error(res.message)
                }
            }

        } catch (error) {
            console.log(error)
            return toast.error("User Authentication error")
        }
        finally {
            setIsLoading(false)
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            otp: formData.otp,
            password: formData.password,
            role: "ADMIN",
            description: "Business Level Admin"
        }


        const res = await sendSignupRequestAPI(payload);

        setIsLoading(false);

        if (res?.success) {
            toast.success("Account is Created");
            dispatch(
                loginSuccess({
                    user: res.user,
                    role: res.user.role.name
                })
            );

            localStorage.setItem('isUserLogin', "true")

            navigate("/setup")

        } else {
            toast.error(res?.message || "Invalid OTP");
        }

    };


    // Forgot Password : 

    const sendForgotOtp = async () => {
        setIsLoading(true);
        const res = await sendOTPRequest({ email: formData.email });
        setIsLoading(false);

        // console.log(res)

        if (!res.success) return toast.error(res.message);

        setForgotStep("OTP");
        toast.success("OTP sent");
    };

    const verifyForgotOtp = async () => {
        setIsLoading(true);
        const res = await sendVerifyOTP({
            email: formData.email,
            otp: formData.otp
        });
        setIsLoading(false);

        if (!res.success) return toast.error(res.message);

        setForgotStep("PASSWORD");
        toast.success("OTP verified");
    };

    const updatePassword = async () => {
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);
        const res = await sendNewPassword({
            email: formData.email,
            password: formData.password
        });
        setIsLoading(false);

        if (!res.success) return toast.error(res.message);

        toast.success("Password updated");
        setForgotStep(null);
        setIsLogin(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center px-4 sm:px-6 transition-colors">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">

                {forgotStep ? (
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {forgotStep ? "Send OTP" : isLogin ? "Verify-OTP" : "Update"}
                    </h2>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {isOtpSent ? "Verify Email" : isLogin ? "Sign in" : "Create account"}
                        </h2>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {isOtpSent
                                ? `Verification code sent to ${formData.email}`
                                : isLogin
                                    ? "Access your ERP dashboard"
                                    : "Create your ERP account"}
                        </p>
                    </>
                )}
            </div >

            {/* ===== FORGOT PASSWORD ===== */}

            < div className="sm:mx-auto sm:w-full sm:max-w-md" >
                <div className="bg-white dark:bg-gray-900 border dark:text-white border-gray-200 dark:border-gray-800 rounded-lg p-6">

                    {forgotStep && (
                        <>
                            {forgotStep === "EMAIL" && (
                                <>
                                    <InputField label="Email" icon={<Mail />} name="email" value={formData.email} onChange={handleChange} />
                                    <PrimaryButton onClick={sendForgotOtp} loading={isLoading} text="Send OTP" />
                                </>
                            )}

                            {forgotStep === "OTP" && (
                                <>
                                    <InputField label="OTP" name="otp" value={formData.otp} onChange={handleChange} />
                                    <PrimaryButton onClick={verifyForgotOtp} loading={isLoading} text="Verify OTP" />
                                </>
                            )}

                            {forgotStep === "PASSWORD" && (
                                <>
                                    <InputField label="New Password" type="password" name="password" value={formData.password} onChange={handleChange} />
                                    <InputField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                                    <PrimaryButton onClick={updatePassword} loading={isLoading} text="Update Password" />
                                </>
                            )}

                            <button
                                className="mt-4 text-sm text-blue-600"
                                onClick={() => setForgotStep(null)}
                            >
                                Back to Login
                            </button>
                        </>
                    )}

                    {!forgotStep && (
                        <>
                            {!isOtpSent ? (

                                <form className="space-y-4" onSubmit={handleAuthSubmit}>
                                    {!isLogin && (
                                        <InputField
                                            label="Full Name"
                                            icon={<User size={18} />}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            placeholder="John Doe"
                                        />
                                    )}

                                    <InputField
                                        label="Email"
                                        icon={<Mail size={18} />}
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="you@example.com"
                                    />

                                    {!isLogin && (

                                        <InputField
                                            label="Phone"
                                            icon={<PhoneIcon size={18} />}
                                            name="phone"
                                            type="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            placeholder="+91 "
                                        />
                                    )}

                                    <InputField
                                        label="Password"
                                        icon={<Lock size={18} />}
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="••••••••"
                                    />

                                    {!isLogin && (
                                        <InputField
                                            label="Confirm Password"
                                            icon={<ShieldCheck size={18} />}
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            placeholder="••••••••"
                                        />
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-md cursor-pointer bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? "Sign in" : "Sign up"}
                                    </button>
                                </form>
                            ) : (
                                <form className="space-y-5" onSubmit={handleVerifyOtp}>
                                    <div className="text-center">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Enter verification code
                                        </label>
                                        <input
                                            name="otp"
                                            type="text"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="mt-3 w-full text-center text-xl tracking-widest h-11 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            placeholder="000000"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
                                    </button>

                                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        Didn’t receive the code?{" "}
                                        <button type="button" className="text-blue-600 hover:underline">
                                            Resend
                                        </button>
                                    </p>
                                </form>
                            )}

                            {!isOtpSent && (
                                <>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            className="text-sm my-2 cursor-pointer text-blue-600"
                                            onClick={() => setForgotStep("EMAIL")}
                                        >
                                            Forgot Password?
                                        </button>
                                    )}

                                    <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="w-full h-11 rounded-md border cursor-pointer border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {isLogin ? "Create a new account" : "Already have an account? Sign in"}
                                    </button>
                                </>
                            )
                            }
                        </>
                    )}

                </div>
            </div >

        </div >
    );
};

const InputField = ({
    label,
    icon,
    ...props
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
        </label>

        <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                {icon}
            </span>
            <input
                {...props}
                required
                className="w-full h-11 pl-10 pr-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
        </div>
    </div>
);

const PrimaryButton = ({ loading, text, ...props }) => (
    <button {...props} className="w-full h-11 bg-blue-600 text-white rounded-md mt-4 cursor-pointer flex justify-center items-center">
        {loading ? <Loader2 className="animate-spin" /> : text}
    </button>
);


export default Auth;
