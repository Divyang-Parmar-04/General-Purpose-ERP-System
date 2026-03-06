import React, { useState } from "react";
import UserProfile from "../components/UserProfile";
import BusinessProfile from "../components/BusinessProfile";
import { Settings } from "lucide-react";

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
                Business • Configuration
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg md:p-6">
          {activeTab === "BUSINESS" ? <BusinessProfile /> : <UserProfile />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;