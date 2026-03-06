import React, { useState } from 'react';
import { X, User, Mail, Phone, Shield, Activity, Edit2, Lock, Check, ArrowLeft, Loader2 } from 'lucide-react';

import { sendNewPassword, sendOTPRequest, sendVerifyOTP } from '../../utils/auth/auth.util';
import { toast } from "react-hot-toast"


function UserProfile({ setIsOpen, user }) {

    const [userData, setUserData] = useState({

        email: user?.email,
        id: user._id,
        name: user?.name,
        phone: user?.phone,
        managerId:user?.managerId,
        role: {
            name: user?.role?.name,
            description: user?.role?.description
        },
        status: user?.status
    });

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [tempPhone, setTempPhone] = useState(userData.phone);

    const [passwordStep, setPasswordStep] = useState(null); // null, 'email', 'otp', 'newPassword'
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // const handlePhoneSave = () => {
    //     setUserData({ ...userData, phone: tempPhone });
    //     setIsEditingPhone(false);
    //     toast.success('Phone number updated successfully!');
    // };

    const handleSendOTP = async () => {
        if (!resetEmail) {
            toast.error('Please enter email');
            return;
        }
        setIsLoading(true)
        const res = await sendOTPRequest({ email: resetEmail });
        setIsLoading(false)

        if (!res.success) return toast.error(res.message);

        toast.success('OTP sent to your email!');
        setPasswordStep('otp');
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }
        setIsLoading(true)
        const res = await sendVerifyOTP({
            email: resetEmail,
            otp: otp
        });
        setIsLoading(false)
        if (!res.success) return toast.error(res.message);

        toast.success('OTP verified successfully!');
        setPasswordStep('newPassword');
    };

    const handlePasswordReset = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        setIsLoading(true)
        const res = await sendNewPassword({
            email: resetEmail,
            password: newPassword
        });
        setIsLoading(false)

        if (!res.success) return toast.error(res.message);

        toast.success('Password changed successfully!');
        setPasswordStep(null);
        setResetEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const getStatusColor = (status) => {
        return status === 'ACTIVE'
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    };


    return (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='w-full max-w-lg sm:max-w-xl rounded-2xl bg-white dark:bg-gray-800 max-h-[85vh] sm:max-h-[70vh] overflow-y-auto shadow-2xl transition-all duration-300 transform scale-100'>

                {/* Header */}
                <div className='p-4 sm:p-5 text-black relative w-full border-b border-gray-100 dark:border-gray-700/50'>
                    <button
                        className='absolute top-3 right-3 sm:top-5 sm:right-5 p-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all'
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>

                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'>
                            <User size={24} className='text-white' />
                        </div>
                        <div>
                            <h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>Profile Settings</h2>
                            <p className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm'>Manage your personal account</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {!passwordStep ? (
                    <div className='p-4 sm:p-6 space-y-5 sm:space-y-6'>

                        {/* Personal Information */}
                        <div className='space-y-3 sm:space-y-4'>
                            <h3 className='text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 flex items-center gap-2 uppercase tracking-widest'>
                                <User size={14} className='text-blue-500' />
                                Personal Info
                            </h3>

                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {/* Name */}
                                <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors'>
                                    <label className='flex text-[10px] sm:text-xs font-bold gap-2 items-center text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1'>
                                        Full Name
                                    </label>
                                    <p className='text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100'>{userData.name}</p>
                                </div>

                                {/* Email */}
                                <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors'>
                                    <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2'>
                                        Email Address
                                    </label>
                                    <p className='text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate'>{userData.email}</p>
                                </div>

                                {/* Phone */}
                                <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors'>
                                    <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2'>
                                        Phone Number
                                    </label>
                                    <div className='flex items-center justify-between'>
                                        <p className='text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100'>{userData.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className='space-y-3 sm:space-y-4'>
                            <h3 className='text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 flex items-center gap-2 uppercase tracking-widest'>
                                <Shield size={14} className='text-blue-500' />
                                Account Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Role */}
                                <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50'>
                                    <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5'>
                                        Your Role
                                    </label>
                                    <div className='flex flex-col gap-1'>
                                        <span className='w-fit px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] sm:text-xs font-bold border border-blue-100 dark:border-blue-800/50'>
                                            {userData.role.name}
                                        </span>
                                        <span className='text-[12px] sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1'>{userData.role.description}</span>
                                    </div>
                                </div>

                                {userData.managerId && (
                                    <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50'>
                                        <label className='text-[10px] sm:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5'>
                                            Your Manager
                                        </label>
                                        <div className='flex flex-col gap-2'>
                                            <span className='w-fit px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] sm:text-xs font-bold border border-blue-100 dark:border-blue-800/50'>
                                                {userData?.managerId?.name}
                                            </span>
                                            <span className='text-[12px] sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1'>Email : {userData?.managerId?.email}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div className='bg-gray-50/50 dark:bg-gray-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50'>
                                    <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-2'>
                                        Status
                                    </label>
                                    <span className={`w-fit inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border ${getStatusColor(userData.status).replace(' rounded-lg', ' rounded-md')}`}>
                                        <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse'></div>
                                        {userData.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className='pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-700/50'>
                            <button
                                onClick={() => setPasswordStep('email')}
                                className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:py-3.5 rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm sm:text-base'
                            >
                                <Lock size={18} />
                                Change Password
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='p-5 sm:p-8'>
                        {/* Email Step */}
                        {passwordStep === 'email' && (
                            <div className='space-y-5'>
                                <button
                                    onClick={() => setPasswordStep(null)}
                                    className='flex items-center gap-2 cursor-pointer text-gray-400 hover:text-blue-600 transition-colors mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider'
                                >
                                    <ArrowLeft size={16} />
                                    Back to Profile
                                </button>

                                <div className='text-center space-y-2'>
                                    <div className='w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm'>
                                        <Mail size={28} className='text-blue-600' />
                                    </div>
                                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>Verify Email</h3>
                                    <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>Enter your email to receive a code</p>
                                </div>

                                <div className='space-y-4'>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1'>
                                            Email Address
                                        </label>
                                        <input
                                            type='email'
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600'
                                            placeholder='name@company.com'
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendOTP}
                                        className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20 text-sm'
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP Code"}

                                    </button>
                                </div>
                            </div>
                        )}

                        {/* OTP Verification Step */}
                        {passwordStep === 'otp' && (
                            <div className='space-y-5'>
                                <button
                                    onClick={() => setPasswordStep('email')}
                                    className='flex cursor-pointer items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider'
                                >
                                    <ArrowLeft size={16} />
                                    Change Email
                                </button>

                                <div className='text-center space-y-2'>
                                    <div className='w-14 h-14 sm:w-16 sm:h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm'>
                                        <Shield size={28} className='text-green-600' />
                                    </div>
                                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>Enter OTP</h3>
                                    <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4'>We sent a code to <span className="text-gray-900 dark:text-white font-bold">{resetEmail}</span></p>
                                </div>

                                <div className='space-y-4'>
                                    <div className="space-y-1.5">
                                        <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1'>
                                            6-Digit Code
                                        </label>
                                        <input
                                            type='text'
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-lg sm:text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-100 text-center tracking-[0.5em] font-bold transition-all'
                                            placeholder='000000'
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        onClick={handleVerifyOTP}
                                        className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20 text-sm'
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify-OTP"}

                                    </button>
                                </div>
                            </div>
                        )}

                        {/* New Password Step */}
                        {passwordStep === 'newPassword' && (
                            <div className='space-y-5'>
                                <button
                                    onClick={() => setPasswordStep('otp')}
                                    className='flex cursor-pointer items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider'
                                >
                                    <ArrowLeft size={16} />
                                    Back to OTP
                                </button>

                                <div className='text-center space-y-2'>
                                    <div className='w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm'>
                                        <Lock size={28} className='text-indigo-600' />
                                    </div>
                                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>New Password</h3>
                                    <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>Secure your account</p>
                                </div>

                                <div className='space-y-4'>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1'>
                                                New Password
                                            </label>
                                            <input
                                                type='password'
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-100 transition-all'
                                                placeholder='••••••••'
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className='text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1'>
                                                Confirm New Password
                                            </label>
                                            <input
                                                type='password'
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-100 transition-all'
                                                placeholder='••••••••'
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePasswordReset}
                                        className='w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3.5 rounded-xl font-bold cursor-pointer transition-all shadow-lg text-sm active:scale-95'
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}

                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;