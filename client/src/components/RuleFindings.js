import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const RuleFindings = ({ findings }) => {
  const getRuleDescription = (rule) => {
    const descriptions = {
      'TOTALS_BALANCE': {
        title: 'Invoice Totals Balance',
        description: 'Validates that total_excl_vat + vat_amount = total_incl_vat',
        fix: 'Ensure your invoice totals are calculated correctly'
      },
      'LINE_MATH': {
        title: 'Line Item Mathematics',
        description: 'Validates that qty × unit_price = line_total for each line item',
        fix: 'Check line item calculations for accuracy'
      },
      'DATE_ISO': {
        title: 'ISO Date Format',
        description: 'Validates that invoice dates follow YYYY-MM-DD format',
        fix: 'Use ISO date format like 2025-01-31'
      },
      'CURRENCY_ALLOWED': {
        title: 'Allowed Currency',
        description: 'Validates currency is one of: AED, SAR, MYR, USD',
        fix: 'Use only supported currencies for your region'
      },
      'TRN_PRESENT': {
        title: 'Tax Registration Numbers',
        description: 'Validates that both buyer and seller TRN fields are present',
        fix: 'Ensure both buyer.trn and seller.trn are provided'
      }
    };
    return descriptions[rule] || { title: rule, description: 'Unknown rule', fix: 'Please check the documentation' };
  };

  const getStatusIcon = (ok) => {
    return ok ? (
      <CheckCircle className="h-5 w-5 text-success-600" />
    ) : (
      <XCircle className="h-5 w-5 text-danger-600" />
    );
  };

  const getStatusBadge = (ok) => {
    return ok ? (
      <span className="badge-success">PASS</span>
    ) : (
      <span className="badge-danger">FAIL</span>
    );
  };

  const formatExampleValue = (finding) => {
    if (finding.rule === 'LINE_MATH' && finding.exampleLine) {
      return `Line ${finding.exampleLine}: Expected ${finding.expected}, got ${finding.got}`;
    }
    if (finding.rule === 'TOTALS_BALANCE' && finding.expected !== undefined) {
      return `Expected ${finding.expected}, got ${finding.got}`;
    }
    if (finding.value) {
      return `Invalid value: "${finding.value}"`;
    }
    return finding.message || 'See details above';
  };

  const passedRules = findings.filter(f => f.ok);
  const failedRules = findings.filter(f => !f.ok);

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Rule Validation Results
        </h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <div className="text-2xl font-bold text-success-600">{passedRules.length}</div>
          <div className="text-sm text-success-700 dark:text-success-300">Rules Passed</div>
        </div>
        <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
          <div className="text-2xl font-bold text-danger-600">{failedRules.length}</div>
          <div className="text-sm text-danger-700 dark:text-danger-300">Rules Failed</div>
        </div>
      </div>

      {/* Rule Details */}
      <div className="space-y-4">
        {findings.map((finding, index) => {
          const ruleInfo = getRuleDescription(finding.rule);
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                finding.ok
                  ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20'
                  : 'border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(finding.ok)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {ruleInfo.title}
                      </h4>
                      {getStatusBadge(finding.ok)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {ruleInfo.description}
                    </p>
                    
                    {!finding.ok && (
                      <div className="space-y-2">
                        {/* Error Details */}
                        <div className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <Info className="h-4 w-4 text-danger-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-danger-800 dark:text-danger-200 mb-1">
                              Issue Found:
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                              {formatExampleValue(finding)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Fix Suggestion */}
                        <div className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Recommended Fix:
                            </div>
                            <div className="text-blue-700 dark:text-blue-300">
                              {ruleInfo.fix}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          failedRules.length === 0
            ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
            : 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800'
        }`}>
          {failedRules.length === 0 ? (
            <>
              <CheckCircle className="h-5 w-5 text-success-600" />
              <div>
                <div className="font-medium text-success-800 dark:text-success-200">
                  All validation rules passed!
                </div>
                <div className="text-sm text-success-700 dark:text-success-300">
                  Your data meets all GETS v0.1 validation requirements.
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-warning-600" />
              <div>
                <div className="font-medium text-warning-800 dark:text-warning-200">
                  {failedRules.length} validation rule{failedRules.length > 1 ? 's' : ''} failed
                </div>
                <div className="text-sm text-warning-700 dark:text-warning-300">
                  Address the issues above to improve your e-invoicing readiness.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleFindings;