
import { Facebook, Twitter, Instagram, Linkedin, Mail, LayoutTemplate } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 pt-16 pb-8 transition-colors duration-300 px-3 md:px-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <LayoutTemplate className="h-6 w-6 text-blue-600" />
                            <span className="font-bold text-xl text-gray-900 dark:text-white">ERP Master</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Simplifying business management for creating seamless workflows and driving growth.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Integrations</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Changelog</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
                            <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                                <Mail className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                            <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                            <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-600 cursor-pointer transition-colors" />
                            <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-700 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">© 2026 ERP Master. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-gray-400 dark:text-gray-500">
                        <span className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
