import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

const NewAnalysisButton = () => {
  const location = useLocation();
  
  // Don't show on the main analyzer page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Link
      to="/"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary-600 hover:bg-primary-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
      title="Start New Analysis"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
        New Analysis
      </span>
    </Link>
  );
};

export default NewAnalysisButton;