import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, ArrowLeft, LayoutDashboard } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Animated Icon Area */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-5 bg-blue-50 rounded-full border border-blue-100">
              <MapPinOff className="w-14 h-14 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Navigation Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform active:scale-[0.98] transition-all shadow-md shadow-blue-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
        <span className="font-semibold text-gray-500">RED Hawk</span> 
        <span>•</span>
        <span>ERP Systems v1.0</span>
      </div>
    </div>
  );
};

export default NotFound;