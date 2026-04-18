import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, Loader2, Moon, Sun, PhoneCallIcon, PhoneIcon, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { sendLoginRequestAPI, sendNewPassword, sendOTPRequest, sendOTPRequestAPI, sendSignupRequestAPI, sendVerifyOTP } from '../../utils/auth/auth.util';
import { loginSuccess } from '../../store/slices/auth.slice';

/* ─── Animated background orb ─── */
const Orb = ({ className }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        animate={{ scale: [1, 1.2, 1], x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
);

/* ─── Input Field ─── */
const InputField = ({ label, icon, type = 'text', showToggle, ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    return (
        <div className="group">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200">
                        {icon}
                    </span>
                )}
                <input
                    {...props}
                    type={inputType}
                    required
                    className={`
            w-full h-11 rounded-xl border text-sm transition-all duration-200 outline-none
            bg-gray-50 dark:bg-gray-800/60
            border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-blue-500 dark:focus:border-blue-400
            focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
            focus:bg-white dark:focus:bg-gray-800
            ${icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
          `}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── Primary Button ─── */
const PrimaryButton = ({ loading, text, onClick, type = 'button' }) => (
    <motion.button
        type={type}
        onClick={onClick}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
    >
        {loading ? <Loader2 size={18} className="animate-spin" /> : text}
    </motion.button>
);

/* ─── Step indicator dots ─── */
const StepDots = ({ steps, current }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
                <motion.div
                    animate={{ scale: current === i ? 1.1 : 1 }}
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${current > i
                        ? 'bg-blue-600 text-white'
                        : current === i
                            ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        }`}
                >
                    {current > i ? '✓' : i + 1}
                </motion.div>
                {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 rounded-full transition-all duration-500 ${current > i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
            </div>
        ))}
    </div>
);

/* ─── Panel fade variant ─── */
const panelVariant = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};


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

                    localStorage.setItem("token", res.token)

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
                    if (res.message === "Your account is Suspended") {
                        toast.error("Your account is Suspended")
                    }
                    else {
                        toast.error("Invalid Credentials")
                    }
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
            localStorage.setItem("token", res.token)
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

    const switchMode = () => { setIsLogin(p => !p); setIsOtpSent(false); setForgotStep(null); };

    /* ── Derived UI state ── */
    const forgotStepIndex = { EMAIL: 0, OTP: 1, PASSWORD: 2 }[forgotStep] ?? 0;

    const getTitle = () => {
        if (forgotStep) return ['Reset Password', 'Verify OTP', 'New Password'][forgotStepIndex];
        if (isOtpSent) return 'Verify Email';
        return isLogin ? 'Welcome back' : 'Create account';
    };

    const getSubtitle = () => {
        if (forgotStep === 'EMAIL') return 'Enter your email to receive a reset code';
        if (forgotStep === 'OTP') return 'Enter the OTP sent to your inbox';
        if (forgotStep === 'PASSWORD') return 'Choose a strong new password';
        if (isOtpSent) return `Code sent to ${formData.email}`;
        return isLogin ? 'Sign in to your ERP dashboard' : 'Start your free account today';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-300">

            {/* Background orbs */}
            <Orb className="w-96 h-96 bg-blue-300/40 dark:bg-blue-700/20 -top-24 -left-24" />
            <Orb className="w-72 h-72 bg-indigo-300/30 dark:bg-indigo-700/15 -bottom-16 -right-16" />

            {/* Dot grid */}
            <div
                className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '26px 26px' }}
            />

            {/* ── Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Brand badge */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 shadow-sm">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-black">E</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide">ERP Master</span>
                    </div>
                </div>

                {/* Glass card */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white dark:border-gray-800 shadow-xl shadow-blue-900/10 dark:shadow-blue-900/30 overflow-hidden">

                    {/* Card top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />

                    <div className="p-6 sm:p-8">

                        {/* Header */}
                        <div className="text-center mb-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={getTitle()} {...panelVariant}>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {getTitle()}
                                    </h1>
                                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        {getSubtitle()}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ══ FORGOT PASSWORD FLOW ══ */}
                        <AnimatePresence mode="wait">
                            {forgotStep ? (
                                <motion.div key="forgot" {...panelVariant}>
                                    <StepDots steps={['Email', 'OTP', 'Password']} current={forgotStepIndex} />

                                    <div className="space-y-4">
                                        {forgotStep === 'EMAIL' && (
                                            <>
                                                <InputField label="Email address" icon={<Mail size={16} />} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                                                <PrimaryButton onClick={sendForgotOtp} loading={isLoading} text="Send reset code" />
                                            </>
                                        )}

                                        {forgotStep === 'OTP' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                                        Verification code
                                                    </label>
                                                    <input
                                                        name="otp"
                                                        type="text"
                                                        maxLength={6}
                                                        value={formData.otp}
                                                        onChange={handleChange}
                                                        className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                        placeholder="──────"
                                                    />
                                                </div>
                                                <PrimaryButton onClick={verifyForgotOtp} loading={isLoading} text="Verify code" />
                                            </>
                                        )}

                                        {forgotStep === 'PASSWORD' && (
                                            <>
                                                <InputField label="New password" icon={<Lock size={16} />} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" />
                                                <InputField label="Confirm password" icon={<ShieldCheck size={16} />} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
                                                <PrimaryButton onClick={updatePassword} loading={isLoading} text="Update password" />
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setForgotStep(null)}
                                        className="mt-5 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Back to sign in
                                    </button>
                                </motion.div>

                            ) : !isOtpSent ? (

                                /* ══ MAIN AUTH FORM ══ */
                                <motion.form key={isLogin ? 'login' : 'register'} {...panelVariant} className="space-y-4" onSubmit={handleAuthSubmit}>
                                    {!isLogin && (
                                        <InputField label="Full name" icon={<User size={16} />} name="name" value={formData.name} onChange={handleChange} disabled={isLoading} placeholder="John Doe" />
                                    )}

                                    <InputField label="Email address" icon={<Mail size={16} />} name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="you@example.com" />

                                    {!isLogin && (
                                        <InputField label="Phone number" icon={<PhoneIcon size={16} />} name="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={isLoading} placeholder="+91 00000 00000" />
                                    )}

                                    <InputField label="Password" icon={<Lock size={16} />} name="password" type="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="••••••••" />

                                    {!isLogin && (
                                        <InputField label="Confirm password" icon={<ShieldCheck size={16} />} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} placeholder="••••••••" />
                                    )}

                                    {isLogin && (
                                        <div className="flex justify-end -mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setForgotStep('EMAIL')}
                                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    <div className="pt-1">
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
                                        >
                                            {isLoading
                                                ? <Loader2 size={18} className="animate-spin" />
                                                : isLogin ? 'Sign in →' : 'Create account →'
                                            }
                                        </motion.button>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 py-1">
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                    </div>

                                    {/* Switch mode */}
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                                    >
                                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                                    </button>
                                </motion.form>

                            ) : (

                                /* ══ OTP VERIFY ══ */
                                <motion.form key="otp" {...panelVariant} className="space-y-5" onSubmit={handleVerifyOtp}>
                                    {/* OTP icon */}
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
                                            <KeyRound size={28} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 text-center">
                                            Enter 6-digit code
                                        </label>
                                        <input
                                            name="otp"
                                            type="text"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-full h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-center text-3xl font-bold tracking-[0.6em] text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="──────"
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & continue →'}
                                    </motion.button>

                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        Didn't receive the code?{' '}
                                        <button type="button" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 transition-colors">
                                            <RefreshCw size={12} /> Resend
                                        </button>
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setIsOtpSent(false)}
                                        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Change email
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Card footer */}
                    <div className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                            By continuing, you agree to our{' '}
                            <button className="text-blue-600 dark:text-blue-400 hover:underline">Terms</button>
                            {' '}and{' '}
                            <button className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</button>
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    );

};


export default Auth;
