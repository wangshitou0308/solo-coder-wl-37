import React from 'react';
import { DiseaseStatus, STATUS_COLORS, DiseaseSeverity, SEVERITY_COLORS } from '@/types';

interface StatusBadgeProps {
  status?: DiseaseStatus;
  severity?: DiseaseSeverity;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, severity, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  if (status) {
    const color = STATUS_COLORS[status];
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}` }}
      >
        {status}
      </span>
    );
  }

  if (severity) {
    const color = SEVERITY_COLORS[severity];
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}`,
          boxShadow: severity === '危险' ? `0 0 8px ${color}` : 'none',
        }}
      >
        {severity}
      </span>
    );
  }

  return null;
};
