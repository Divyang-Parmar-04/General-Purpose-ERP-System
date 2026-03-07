import React, { useState } from "react";
import UserProfile from "../components/UserProfile";
import BusinessProfile from "../components/BusinessProfile";
import { Settings, Building2, UserCircle } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("BUSINESS");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Settings className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure your business profile and personal account settings
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("BUSINESS")}
            className={`flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "BUSINESS"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-500 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
          >
            <Building2 className="w-4 h-4" />
            Business Profile
          </button>
          <button
            onClick={() => setActiveTab("USER")}
            className={`flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "USER"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-500 shadow-md "
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
          >
            <UserCircle className="w-4 h-4" />
            My Account
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "BUSINESS" ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <BusinessProfile />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <UserProfile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;