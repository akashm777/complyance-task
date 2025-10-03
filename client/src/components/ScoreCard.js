import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ title, score, description, color, weight }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        progress: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        progress: 'bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        progress: 'bg-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);
  const percentage = Math.min(100, Math.max(0, score));

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };

  return (
    <div className={`card p-6 ${colorClasses.bg} ${colorClasses.border} border`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        {weight && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {weight}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Score Display */}
        <div className="flex items-end space-x-2">
          <motion.span
            className={`text-3xl font-bold ${colorClasses.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {score}
          </motion.span>
          <span className="text-lg text-gray-500 dark:text-gray-400 mb-1">
            / 100
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="progress-bar">
            <motion.div
              className={`progress-fill ${colorClasses.progress}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span className={`font-medium ${colorClasses.text}`}>
              {getScoreLabel(score)}
            </span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;