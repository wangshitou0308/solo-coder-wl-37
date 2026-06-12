import React from 'react';
import { Grade, GRADE_COLORS, GRADE_LABELS } from '@/types';

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, size = 'md', showLabel = true }) => {
  const color = GRADE_COLORS[grade];
  const label = GRADE_LABELS[grade];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded ${sizeClasses[size]}`}
      style={{
        backgroundColor: color,
        color: grade === 'E' ? '#fff' : grade === 'A' ? '#fff' : '#000',
        boxShadow: grade === 'E' ? `0 0 10px ${color}` : 'none',
        animation: grade === 'E' ? 'pulse 2s infinite' : 'none',
      }}
    >
      <span className="mr-1">{grade}</span>
      {showLabel && <span className="font-normal">({label})</span>}
    </span>
  );
};
