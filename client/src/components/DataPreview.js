import React from 'react';
import { Hash, Calendar, Type, AlertCircle } from 'lucide-react';

const DataPreview = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300">No data to preview</p>
        </div>
      </div>
    );
  }

  // Get all unique keys from the data
  const allKeys = [...new Set(data.flatMap(row => Object.keys(row)))];
  
  // Infer data types for each column
  const inferType = (value) => {
    if (value === null || value === undefined || value === '') return 'empty';
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && isFinite(numValue)) return 'number';
    
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime()) && value.toString().match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)) {
      return 'date';
    }
    
    return 'string';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'number':
        return <Hash className="h-3 w-3" />;
      case 'date':
        return <Calendar className="h-3 w-3" />;
      case 'empty':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Type className="h-3 w-3" />;
    }
  };

  const getTypeBadge = (type) => {
    const baseClasses = "inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium";
    
    switch (type) {
      case 'number':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'date':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'empty':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
    }
  };

  // Sample a few values from each column to determine type
  const columnTypes = {};
  allKeys.forEach(key => {
    const values = data.slice(0, 5).map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length > 0) {
      const types = values.map(inferType);
      // Use the most common type
      columnTypes[key] = types.sort((a, b) =>
        types.filter(v => v === a).length - types.filter(v => v === b).length
      ).pop();
    } else {
      columnTypes[key] = 'empty';
    }
  });

  const formatValue = (value, type) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">empty</span>;
    }
    
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }
    
    const stringValue = value.toString();
    if (stringValue.length > 50) {
      return stringValue.substring(0, 50) + '...';
    }
    
    return stringValue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with column types */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Data Preview ({data.length} rows)
          </h4>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Hash className="h-3 w-3" />
              <span>Number</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Date</span>
            </div>
            <div className="flex items-center space-x-1">
              <Type className="h-3 w-3" />
              <span>Text</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>Empty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="truncate max-w-32" title={key}>
                        {key}
                      </span>
                    </div>
                    <div className={getTypeBadge(columnTypes[key])}>
                      {getTypeIcon(columnTypes[key])}
                      <span>{columnTypes[key]}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {allKeys.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {formatValue(row[key], columnTypes[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing first {data.length} rows • {allKeys.length} columns detected
        </p>
      </div>
    </div>
  );
};

export default DataPreview;