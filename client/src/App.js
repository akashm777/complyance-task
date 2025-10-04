import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Wizard from './components/Wizard';
import ReportView from './components/ReportView';
import ShareView from './components/ShareView';
import RecentReports from './components/RecentReports';
import NewAnalysisButton from './components/NewAnalysisButton';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState(null);
  const [reportData, setReportData] = useState(null);

  return (
    <ThemeProvider>
      <Router 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          
          <main className="container mx-auto px-4 py-4 sm:py-8">
            <Routes>
              <Route 
                path="/" 
                element={
                  <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-4">
                        InvoiceMend
                      </h1>
                      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Analyze your invoice data against GETS v0.1 standards and discover gaps 
                        to improve your e-invoicing readiness.
                      </p>
                    </div>
                    
                    <Wizard 
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      uploadData={uploadData}
                      setUploadData={setUploadData}
                      reportData={reportData}
                      setReportData={setReportData}
                    />
                  </div>
                } 
              />
              
              <Route 
                path="/report/:reportId" 
                element={<ReportView />} 
              />
              
              <Route 
                path="/share/:reportId" 
                element={<ShareView />} 
              />
              
              <Route 
                path="/reports" 
                element={<RecentReports />} 
              />
            </Routes>
          </main>
          
          {/* Floating New Analysis Button */}
          <NewAnalysisButton />
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;