import React from 'react';
import { Bridge, BRIDGE_TYPE_COLORS } from '@/types';
import { GradeBadge } from '@/components/common/GradeBadge';
import { MapPin, Building2, Calendar } from 'lucide-react';

interface BridgeCardProps {
  bridge: Bridge;
  onClick?: () => void;
}

export const BridgeCard: React.FC<BridgeCardProps> = ({ bridge, onClick }) => {
  const typeColor = BRIDGE_TYPE_COLORS[bridge.type];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{bridge.name}</h3>
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded text-white"
            style={{ backgroundColor: typeColor }}
          >
            {bridge.type}
          </span>
        </div>
        <GradeBadge grade={bridge.currentGrade} size="sm" showLabel={false} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 size={14} />
          <span>{bridge.material}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{bridge.buildYear}年建成</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span className="truncate">{bridge.managementUnit}</span>
        </div>
      </div>

      {bridge.photos.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <img
            src={bridge.photos[0]}
            alt={bridge.name}
            className="w-full h-24 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
};
