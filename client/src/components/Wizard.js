import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ContextStep from './wizard/ContextStep';
import UploadStep from './wizard/UploadStep';
import ResultsStep from './wizard/ResultsStep';

const steps = [
  { id: 1, title: 'Context', description: 'Set your analysis context' },
  { id: 2, title: 'Upload', description: 'Upload your invoice data' },
  { id: 3, title: 'Results', description: 'View your readiness report' }
];

const Wizard = ({ 
  currentStep, 
  setCurrentStep, 
  uploadData, 
  setUploadData, 
  reportData, 
  setReportData 
}) => {
  const [contextData, setContextData] = useState({
    country: '',
    erp: '',
    questionnaire: {
      webhooks: false,
      sandbox_env: false,
      retries: false
    }
  });

  const resetWizard = () => {
    setCurrentStep(1);
    setUploadData(null);
    setReportData(null);
    setContextData({
      country: '',
      erp: '',
      questionnaire: {
        webhooks: false,
        sandbox_env: false,
        retries: false
      }
    });
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Context step is always optional
      case 2:
        return uploadData && uploadData.uploadId;
      case 3:
        return false; // Can't go beyond results
      default:
        return false;
    }
  };

  const canGoPrev = () => {
    return currentStep > 1;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContextStep 
            contextData={contextData}
            setContextData={setContextData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <UploadStep 
            contextData={contextData}
            uploadData={uploadData}
            setUploadData={setUploadData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <ResultsStep 
            contextData={contextData}
            uploadData={uploadData}
            reportData={reportData}
            setReportData={setReportData}
            onPrev={handlePrev}
            onReset={resetWizard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs sm:text-sm font-medium ${
                      currentStep >= step.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                    currentStep > step.id
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev()}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canGoPrev()
                ? 'btn-secondary'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canGoNext()
                ? 'btn-primary shadow-glow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Wizard;