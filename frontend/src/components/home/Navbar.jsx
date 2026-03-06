import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutTemplate, Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/slices/theme.slice';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { mode } = useSelector((state) => state.theme);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
    ];


    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const handleGetStarted = () => {

        if (user?.businessId) return navigate("/admin/dashboard")
        navigate("/auth")
    }

    return (
        <nav className="fixed w-full bg-white dark:bg-gray-900 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <LayoutTemplate className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">ERP<span className="text-blue-600">Master</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Theme Toggle Button */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
                            aria-label="Toggle Theme"
                        >
                            {mode === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                        </button>

                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all  cursor-pointer" onClick={handleGetStarted}>
                            <Link to="/auth">Get Started</Link>
                        </button>
                    </div>

                    {/* Mobile Button Wrapper */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                        >
                            {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xl transition-colors duration-300">
                    <div className="px-4 py-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="block text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 pl-2 border-l-2 border-transparent hover:border-blue-600 transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold" onClick={handleGetStarted}>
                                <Link to="/auth" onClick={() => setIsOpen(false)} className="block w-full text-center" >Get Started</Link>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
