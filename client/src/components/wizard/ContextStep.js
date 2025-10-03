import React from 'react';
import { Globe, Settings, CheckCircle } from 'lucide-react';

const countries = [
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'US', name: 'United States', currency: 'USD' }
];

const erpSystems = [
  'SAP',
  'Oracle',
  'Microsoft Dynamics',
  'NetSuite',
  'QuickBooks',
  'Xero',
  'Sage',
  'Other'
];

const ContextStep = ({ contextData, setContextData, onNext }) => {
  const handleCountryChange = (e) => {
    setContextData({
      ...contextData,
      country: e.target.value
    });
  };

  const handleErpChange = (e) => {
    setContextData({
      ...contextData,
      erp: e.target.value
    });
  };

  const handleQuestionnaireChange = (field, value) => {
    setContextData({
      ...contextData,
      questionnaire: {
        ...contextData.questionnaire,
        [field]: value
      }
    });
  };

  // Context step is always complete since all fields are optional

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set Analysis Context
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Help us understand your business context for more accurate analysis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Country Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary-600" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Country / Region <span className="text-gray-400">(optional)</span>
            </label>
          </div>
          <select
            value={contextData.country}
            onChange={handleCountryChange}
            className="input"
          >
            <option value="">Select your country (optional)</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.currency})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optional metadata for your report
          </p>
        </div>

        {/* ERP System */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary-600" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ERP System <span className="text-gray-400">(optional)</span>
            </label>
          </div>
          <select
            value={contextData.erp}
            onChange={handleErpChange}
            className="input"
          >
            <option value="">Select your ERP system (optional)</option>
            {erpSystems.map((erp) => (
              <option key={erp} value={erp}>
                {erp}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optional metadata for your report
          </p>
        </div>
      </div>

      {/* Technical Readiness Questionnaire */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Technical Readiness Assessment
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Webhook Support
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Can your system receive real-time notifications?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={contextData.questionnaire.webhooks}
                onChange={(e) => handleQuestionnaireChange('webhooks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Sandbox Environment
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Do you have a testing environment available?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={contextData.questionnaire.sandbox_env}
                onChange={(e) => handleQuestionnaireChange('sandbox_env', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Retry Mechanism
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Can your system handle failed request retries?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={contextData.questionnaire.retries}
                onChange={(e) => handleQuestionnaireChange('retries', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            Ready to proceed!
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            The questionnaire above affects your Posture score (10% of overall readiness). Country and ERP are optional metadata.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContextStep;