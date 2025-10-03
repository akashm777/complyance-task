import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Target } from 'lucide-react';

const CoveragePanel = ({ coverage }) => {
  const { matched = [], close = [], missing = [] } = coverage;
  const total = matched.length + close.length + missing.length;

  const getFieldCategory = (field) => {
    if (field.startsWith('invoice.')) return 'Invoice';
    if (field.startsWith('seller.')) return 'Seller';
    if (field.startsWith('buyer.')) return 'Buyer';
    if (field.startsWith('lines[].')) return 'Line Items';
    return 'Other';
  };

  const groupFieldsByCategory = (fields) => {
    const groups = {};
    fields.forEach(field => {
      const category = getFieldCategory(field);
      if (!groups[category]) groups[category] = [];
      groups[category].push(field);
    });
    return groups;
  };

  const matchedGroups = groupFieldsByCategory(matched);
  const missingGroups = groupFieldsByCategory(missing);

  const formatFieldName = (field) => {
    return field.replace(/\[\]/g, '').replace(/\./g, ' › ');
  };

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          GETS Schema Coverage
        </h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <div className="text-2xl font-bold text-success-600">{matched.length}</div>
          <div className="text-sm text-success-700 dark:text-success-300">Matched</div>
        </div>
        <div className="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <div className="text-2xl font-bold text-warning-600">{close.length}</div>
          <div className="text-sm text-warning-700 dark:text-warning-300">Close Match</div>
        </div>
        <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
          <div className="text-2xl font-bold text-danger-600">{missing.length}</div>
          <div className="text-sm text-danger-700 dark:text-danger-300">Missing</div>
        </div>
      </div>

      {/* Coverage Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Coverage Progress</span>
          <span>{Math.round((matched.length / total) * 100)}% exact matches</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill bg-success-600" 
            style={{ width: `${(matched.length / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Fields */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Matched Fields ({matched.length})
            </h4>
          </div>
          
          {Object.keys(matchedGroups).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(matchedGroups).map(([category, fields]) => (
                <div key={category}>
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {category}
                  </h5>
                  <div className="space-y-1">
                    {fields.map((field) => (
                      <div key={field} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-success-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatFieldName(field)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No exact matches found
            </p>
          )}
        </div>

        {/* Missing Fields */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="h-4 w-4 text-danger-600" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Missing Fields ({missing.length})
            </h4>
          </div>
          
          {Object.keys(missingGroups).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(missingGroups).map(([category, fields]) => (
                <div key={category}>
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {category}
                  </h5>
                  <div className="space-y-1">
                    {fields.map((field) => (
                      <div key={field} className="flex items-center space-x-2 text-sm">
                        <XCircle className="h-3 w-3 text-danger-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatFieldName(field)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-success-600 dark:text-success-400 italic">
              All required fields found!
            </p>
          )}
        </div>
      </div>

      {/* Close Matches */}
      {close.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-4 w-4 text-warning-600" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Potential Matches ({close.length})
            </h4>
          </div>
          <div className="space-y-2">
            {close.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatFieldName(item.target)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Candidate: <span className="font-mono">{item.candidate}</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-warning-600">
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoveragePanel;