
import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Create segmented circle effect
  const segments = 24; // Number of segments
  const segmentAngle = 360 / segments;
  const segmentLength = circumference / segments;
  const gapLength = segmentLength * 0.1; // 10% gap between segments
  const actualSegmentLength = segmentLength - gapLength;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle with segments */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${actualSegmentLength} ${gapLength}`}
          className="opacity-30"
        />
        
        {/* Progress circle with segments */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${actualSegmentLength} ${gapLength}`}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="drop-shadow-sm"
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color }}
          >
            {Math.round(progress)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default CircularProgress;